import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
  ],

  pages: {
    signIn: '/signin',
  },

  callbacks: {
    async signIn({ user }) {
      // Upsert user into Supabase on every sign in
      if (user.email) {
        await supabase.from('users').upsert({
          email: user.email,
          name: user.name,
          avatar: user.image,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'email' })
      }
      return true
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as typeof session.user & { id: string }).id = token.sub
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) token.sub = user.id
      return token
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
