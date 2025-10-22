// auth.js
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login"
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("MISSING_CREDENTIALS")
                }

                const user = await prisma.user.findUnique({
                    where : { email: credentials.email}
                })

                if (!user) {
                    throw new Error("USER_NOT_FOUND")
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error("INVALID_PASSWORD")
                }

                return { id: user.id, email: user.email }
            }

        })
    ],
    callbacks: {
        authorized({ request, auth }) {
            const { pathname } = request.nextUrl
            const isLoggedIn = !!auth // The key check
            
            const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/chat")
            const isAuthRoute = pathname === "/login" || pathname === "/signup"
            
            // 🛑 Add this logging line
            console.log(`[AUTH.JS CHECK] Path: ${pathname}, isLoggedIn: ${isLoggedIn}, Auth Object: ${!!auth ? 'Exists' : 'NULL'}`)

            // 1. Redireccionar usuarios no autenticados a rutas protegidas
            if (isProtectedRoute && !isLoggedIn) {
                const loginUrl = new URL("/login", request.nextUrl)
                loginUrl.searchParams.set("callbackUrl", pathname)
                return Response.redirect(loginUrl)
            }

            // 2. Redireccionar usuarios logueados fuera de las rutas de autenticación
            if (isAuthRoute && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", request.nextUrl))
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.email = user.email
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.email = token.email
            }
            return session
        }
    }
})