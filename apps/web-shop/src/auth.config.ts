import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],
  pages: {
    signIn: "/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  callbacks: {
    async authorized({ auth, request }) {
      const { pathname } = request.nextUrl;

      const isStaticAsset =
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api/auth") ||
        pathname === "/favicon.ico" ||
        /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/i.test(pathname);

      if (isStaticAsset) return true;

      const authGuestOnlyPaths = ["/signin", "/signup", "/forgot-password", "/reset-password"];
      const isAuthGuestOnlyPath = authGuestOnlyPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`)
      );
      const publicPaths = ["/", "/products", "/catalog", "/about", "/contact", "/terms", "/privacy", "/returns", "/faq", "/careers", "/verify-email"];
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
      );

      if (auth?.user && isAuthGuestOnlyPath) {
        return Response.redirect(new URL("/", request.url));
      }

      return isPublicPath || isAuthGuestOnlyPath || !!auth?.user;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
