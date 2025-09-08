import { db } from './db'
import { redis } from './redis'

export interface PopupTargeting {
  paths: string[]
  devices: ('mobile' | 'desktop')[]
  utm?: string[]
}

export interface PopupCapping {
  perSession?: number
  perDay?: number
  cooldownHours?: number
}

export interface PopupSchedule {
  startDate?: string
  endDate?: string
  timeRanges?: Array<{ start: string; end: string }>
}

export interface PopupRequest {
  path: string
  device: 'mobile' | 'desktop'
  utm?: Record<string, string>
  sessionId: string
  userAgent?: string
}

export async function getEligiblePopup(request: PopupRequest) {
  // Get all active popups
  const popups = await db.popup.findMany({
    where: { isActive: true },
    orderBy: { priority: 'desc' },
  })

  for (const popup of popups) {
    if (await isPopupEligible(popup, request)) {
      // Track impression
      await trackPopupImpression(popup.id, request.sessionId)
      
      return {
        id: popup.id,
        title: popup.title,
        content: popup.content,
        ctaText: popup.ctaText,
        ctaUrl: popup.ctaUrl,
      }
    }
  }

  return null
}

async function isPopupEligible(popup: any, request: PopupRequest): Promise<boolean> {
  const targeting = popup.targeting as PopupTargeting
  const capping = popup.capping as PopupCapping
  const schedule = popup.schedule as PopupSchedule | null

  // Check device targeting
  if (!targeting.devices.includes(request.device)) {
    return false
  }

  // Check path targeting
  if (targeting.paths.length > 0) {
    const pathMatches = targeting.paths.some(pattern => {
      if (pattern === '*') return true
      if (pattern.endsWith('*')) {
        return request.path.startsWith(pattern.slice(0, -1))
      }
      return request.path === pattern
    })
    if (!pathMatches) return false
  }

  // Check UTM targeting
  if (targeting.utm && targeting.utm.length > 0 && request.utm) {
    const utmMatches = targeting.utm.some(utmPattern => {
      return Object.values(request.utm!).some(value => 
        value.toLowerCase().includes(utmPattern.toLowerCase())
      )
    })
    if (!utmMatches) return false
  }

  // Check schedule
  if (schedule) {
    const now = new Date()
    
    if (schedule.startDate && now < new Date(schedule.startDate)) {
      return false
    }
    
    if (schedule.endDate && now > new Date(schedule.endDate)) {
      return false
    }
    
    if (schedule.timeRanges && schedule.timeRanges.length > 0) {
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const inTimeRange = schedule.timeRanges.some(range => {
        const [startHour, startMin] = range.start.split(':').map(Number)
        const [endHour, endMin] = range.end.split(':').map(Number)
        const startTime = startHour * 60 + startMin
        const endTime = endHour * 60 + endMin
        return currentTime >= startTime && currentTime <= endTime
      })
      if (!inTimeRange) return false
    }
  }

  // Check frequency capping
  if (capping.perSession || capping.perDay || capping.cooldownHours) {
    const canShow = await checkFrequencyCapping(popup.id, request.sessionId, capping)
    if (!canShow) return false
  }

  return true
}

async function checkFrequencyCapping(
  popupId: string,
  sessionId: string,
  capping: PopupCapping
): Promise<boolean> {
  const now = Date.now()

  // Check session capping
  // Skip frequency capping if Redis is not available
  if (!redis) {
    return true
  }

  if (capping.perSession) {
    const sessionKey = `popup:${popupId}:session:${sessionId}`
    const sessionCount = await redis.get(sessionKey) || 0
    if (Number(sessionCount) >= capping.perSession) {
      return false
    }
  }

  if (capping.perDay) {
    const today = new Date().toISOString().split('T')[0]
    const dayKey = `popup:${popupId}:day:${today}`
    const dayCount = await redis.get(dayKey) || 0
    if (Number(dayCount) >= capping.perDay) {
      return false
    }
  }

  // Skip weekly capping for now (not implemented in schema)
  // if (capping.perWeek) {
  //   const weekStart = getWeekStart()
  //   const weekKey = `popup:${popupId}:week:${weekStart}`
  //   const weekCount = await redis.get(weekKey) || 0
  //   if (Number(weekCount) >= capping.perWeek) {
  //     return false
  //   }
  // }

  // Check cooldown
  if (capping.cooldownHours) {
    const cooldownKey = `popup:${popupId}:cooldown:${sessionId}`
    const lastShown = await redis.get(cooldownKey)
    if (lastShown) {
      const timeSinceLastShown = now - Number(lastShown)
      const cooldownMs = capping.cooldownHours * 60 * 60 * 1000
      if (timeSinceLastShown < cooldownMs) {
        return false
      }
    }
  }

  return true
}

async function trackPopupImpression(popupId: string, sessionId: string) {
  // Skip Redis operations if not available
  if (redis) {
    const now = Date.now()
    const today = new Date().toISOString().split('T')[0]

    // Update session count
    const sessionKey = `popup:${popupId}:session:${sessionId}`
    await redis.incr(sessionKey)
    await redis.expire(sessionKey, 86400) // 24 hours

    // Update daily count
    const dailyKey = `popup:${popupId}:daily:${sessionId}:${today}`
    await redis.incr(dailyKey)
    await redis.expire(dailyKey, 86400) // 24 hours

    // Set cooldown timestamp
    const cooldownKey = `popup:${popupId}:cooldown:${sessionId}`
    await redis.set(cooldownKey, now.toString())
    await redis.expire(cooldownKey, 86400 * 7) // 7 days
  }

  // Update impression count in database
  await db.popup.update({
    where: { id: popupId },
    data: { impressions: { increment: 1 } },
  })
}

export async function trackPopupClick(popupId: string) {
  await db.popup.update({
    where: { id: popupId },
    data: { clicks: { increment: 1 } },
  })
}
