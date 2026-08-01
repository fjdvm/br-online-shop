"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CartItemRow } from "./CartItemRow";
import { EmptyCartState } from "./EmptyCartState";

export function CartPage() {
  const {
    items,
    subtotal,
    totalItems,
    loading,
    error,
    isAuthenticated,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const shippingFee = items.length > 0 ? 100 : 0;
  const totalAmount = subtotal + shippingFee;

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Please sign in to view your shopping cart</h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          You must be signed in to manage your cart and proceed to checkout.
        </p>
        <Button asChild className="rounded-full bg-primary text-white px-8">
          <Link href="/signin">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">Shopping Cart</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Shopping Cart</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        {items.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:bg-destructive/10 text-xs font-semibold rounded-lg gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Clear Cart
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 mb-6 bg-destructive/10 text-destructive text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-border/70 p-12">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground mt-2">Loading your cart...</p>
          </div>
        </div>
      ) : items.length === 0 && !loading ? (
        <div className="bg-surface-card rounded-2xl border border-border/70 p-12">
          <EmptyCartState />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items Table */}
          <div className="lg:col-span-8 bg-surface-card rounded-2xl border border-border/70 p-6 shadow-xs">
            <div className="divide-y divide-border/60">
              {items.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </div>

            <div className="pt-6 mt-4 border-t border-border flex justify-between items-center">
              <Button asChild variant="ghost" className="text-xs font-bold gap-2">
                <Link href="/products">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>

          {/* Order Summary Side Panel */}
          <div className="lg:col-span-4">
            <div className="bg-surface-card rounded-2xl border border-border/70 p-6 shadow-xs sticky top-24 space-y-6">
              <h3 className="font-extrabold text-lg text-foreground border-b border-border pb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-bold text-foreground">₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Shipping</span>
                  <span className="font-bold text-foreground">₱{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-foreground">₱0.00</span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-center">
                  <span className="font-extrabold text-base text-foreground">Total</span>
                  <span className="font-extrabold text-xl text-primary-dark">
                    ₱{totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                asChild
                className="w-full rounded-full py-6 font-bold text-sm bg-primary text-white hover:bg-primary-dark shadow-md"
              >
                <Link href="/checkout" className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <div className="text-center text-[11px] text-muted-foreground space-y-1">
                <p>🔒 100% Secure Checkout</p>
                <p>Fresh Baguio Ube treats delivered directly to your doorstep</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
