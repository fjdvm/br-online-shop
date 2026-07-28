"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingBag, Headphones, User, Menu, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CartSheet } from "@/components/features/cart/CartSheet";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { totalItems, openCart } = useCart();

  const hasUser = Boolean((session as { user?: unknown })?.user);
  const isAuthenticated = status === "authenticated" || hasUser;
  const accountHref = status === "unauthenticated" && !hasUser ? "/signin" : "/profile";

  // Close mobile menu when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/careers", label: "Careers" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface-card border-b border-border/70 shadow-xs">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.jpeg"
            alt="Bren Raphael's Ube Jam & Halaya Logo"
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <span className="font-extrabold text-lg leading-tight tracking-tight block text-primary-dark">
              Bren Raphael&apos;s
            </span>
            <span className="text-xs uppercase tracking-widest font-bold text-secondary block">
              Ube Jam & Halaya
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-primary transition-colors ${
                pathname === link.href ? "text-primary font-bold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Button asChild variant="ghost" size="icon" aria-label="Contact Support" className="rounded-full hidden sm:flex">
              <Link href="/support">
                <Headphones className="w-5 h-5" />
              </Link>
            </Button>
          )}

          <Button asChild variant="ghost" size="icon" aria-label="Account" className="rounded-full hidden sm:flex">
            <Link href={accountHref}>
              <User className="w-5 h-5" />
            </Link>
          </Button>

          <Button
            size="icon"
            onClick={openCart}
            aria-label="Shopping Cart"
            className="relative rounded-full bg-primary text-white hover:bg-primary-dark shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary-light text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>

          {/* Hamburger Button for Mobile / Small Screens */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden rounded-full text-foreground hover:bg-surface-low p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
          </Button>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartSheet />

      {/* Mobile Sidebar Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar Drawer Container (Smooth Slide Left Entrance) */}
          <div className="relative ml-auto w-full max-w-xs bg-surface-card h-full shadow-2xl flex flex-col z-10 border-l border-border/70 animate-slide-left">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border/70 flex items-center justify-between bg-surface-low">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.jpeg"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover shadow-sm"
                />
                <div>
                  <span className="font-extrabold text-sm block text-primary-dark">
                    Bren Raphael&apos;s
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-secondary block">
                    Ube Jam & Halaya
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-full"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-muted" />
              </Button>
            </div>

            {/* Sidebar Navigation Links */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-foreground hover:bg-surface-low hover:text-primary"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  </Link>
                );
              })}

              {isAuthenticated && (
                <Link
                  href="/support"
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all ${
                    pathname === "/support"
                      ? "bg-primary text-white shadow-sm"
                      : "text-foreground hover:bg-surface-low hover:text-primary"
                  }`}
                >
                  <span>Contact Support</span>
                  <ChevronRight className={`w-4 h-4 ${pathname === "/support" ? "text-white" : "text-muted-foreground"}`} />
                </Link>
              )}

              {isAuthenticated ? (
                <Link
                  href="/profile"
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all ${
                    pathname === "/profile"
                      ? "bg-primary text-white shadow-sm"
                      : "text-foreground hover:bg-surface-low hover:text-primary"
                  }`}
                >
                  <span>My Profile</span>
                  <ChevronRight className={`w-4 h-4 ${pathname === "/profile" ? "text-white" : "text-muted-foreground"}`} />
                </Link>
              ) : (
                <Link
                  href="/signin"
                  className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all ${
                    pathname === "/signin"
                      ? "bg-primary text-white shadow-sm"
                      : "text-foreground hover:bg-surface-low hover:text-primary"
                  }`}
                >
                  <span>Sign In</span>
                  <ChevronRight className={`w-4 h-4 ${pathname === "/signin" ? "text-white" : "text-muted-foreground"}`} />
                </Link>
              )}
            </nav>

            {/* Sidebar Footer Action */}
            <div className="p-6 border-t border-border/70 bg-surface-low space-y-3">
              <Link
                href="/products"
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Catalog
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

