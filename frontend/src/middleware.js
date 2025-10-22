// middleware.js

// Usamos el alias "@/" definido en jsconfig para apuntar a "src/auth"
export { auth as middleware } from "./auth"

export const config = {
  // Matcheador de rutas (se mantiene igual, es correcto)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
}