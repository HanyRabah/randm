import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Remove adapter for credentials provider to work with JWT
  // adapter: PrismaAdapter(db),
  providers: [
    // Admin credentials provider
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })
          if (!user || user.role !== 'ADMIN') return null

          // ponytail: dev-only backdoor for the seeded demo admin; disabled in prod
          const isDevDemoAdmin =
            process.env.NODE_ENV !== 'production' &&
            user.email === 'admin@furniturestore.com'

          if (!isDevDemoAdmin) {
            if (!user.password) return null
            const ok = await bcrypt.compare(credentials.password, user.password)
            if (!ok) return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Admin authorize error:', error)
          return null
        }
      }
    }),
    // Customer credentials provider
    CredentialsProvider({
      id: 'customer-credentials',
      name: 'Customer Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        console.log('Customer authorize called with:', credentials.email)
        
        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email }
          })
          
          console.log('Found customer user:', user)
          
          if (user && user.role === 'CUSTOMER' && user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
            
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            }
          }
        } catch (error) {
          console.error('Database error in customer authorize:', error)
        }
        
        console.log('Customer authorization failed')
        return null
      }
    }),
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user && token) {
        (session.user as any).id = token.uid
        ;(session.user as any).role = token.role
      }
      return session
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id
        token.role = (user as any).role
      }
      return token
    },
  },
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
}

export async function requireAdmin() {
  const { getServerSession } = await import('next-auth')
  const session = await getServerSession(authOptions)
  
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
  
  return session
}
