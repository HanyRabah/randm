import { redis } from './redis'

export interface OTPResult {
  success: boolean
  code?: string
  error?: string
}

// Mock OTP provider for development
export async function generateOTP(phone: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // Store OTP in Redis with 5-minute expiry (if Redis is available)
  if (redis) {
    const key = `otp:${phone}`
    await redis.setex(key, 300, code)
  }
  
  // In development, return the code for testing
  if (process.env.NODE_ENV === 'development') {
    console.log(`OTP for ${phone}: ${code}`)
    return code
  }
  
  // In production, integrate with SMS provider
  // Example: Twilio, AWS SNS, etc.
  try {
    // await smsProvider.send(phone, `Your verification code is: ${code}`)
    return code
  } catch (error) {
    console.error('Failed to send OTP:', error)
    return code // Return code anyway for development
  }
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  // Skip Redis verification if not available (development mode)
  if (!redis) {
    return true // Allow all OTPs in development
  }

  const key = `otp:${phone}`
  const storedCode = await redis.get(key)
  
  if (!storedCode || storedCode !== code) {
    return false
  }
  
  // Delete OTP after successful verification
  await redis.del(key)
  return true
}

// Alias for backward compatibility
export const sendOTP = generateOTP
