import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'placeholder',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'placeholder',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID ?? 'placeholder',
      clientSecret: process.env.APPLE_SECRET ?? 'placeholder',
    }),
  ],
  pages: {
    signIn: '/signin',
  },
  callbacks: {
    async session({ session }) {
      return session
    },
  },
})

export { handler as GET, handler as POST }