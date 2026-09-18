import { renderHook, act, waitFor } from "@testing-library/react";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/lib/stores/useCartStore";
import type { CartDto } from "@/types/cart";

// --- Mocks ---------------------------------------------------------------

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/products/abc",
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { accessToken: "token-123" },
    status: "authenticated",
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

const emptyCart: CartDto = { id: "cart-1", userId: "user-1", items: [], subtotal: 0, totalItems: 0 };
const cartAfterAdd: CartDto = {
  id: "cart-1",
  userId: "user-1",
  items: [
    {
      id: "item-1",
      productId: "prod-1",
      productName: "Ube Jam",
      productSKU: "SKU-1",
      unitPrice: 100,
      images: [],
      quantity: 1,
      stock: 10,
      totalPrice: 100,
    },
  ],
  subtotal: 100,
  totalItems: 1,
};

const mockGetCart = jest.fn();
const mockAddItem = jest.fn();
jest.mock("@/lib/api/cart-api", () => ({
  cartApi: {
    getCart: (...args: unknown[]) => mockGetCart(...args),
    addItem: (...args: unknown[]) => mockAddItem(...args),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  },
}));

describe("useCart addToCart does not auto-open the cart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCartStore.getState().clearCartStore();
    mockGetCart.mockResolvedValue(emptyCart);
    mockAddItem.mockResolvedValue(cartAfterAdd);
  });

  it("keeps the cart drawer closed while adding an item", async () => {
    const { result } = renderHook(() => useCart());

    await waitFor(() => expect(mockGetCart).toHaveBeenCalled());
    expect(useCartStore.getState().isOpen).toBe(false);

    await act(async () => {
      await result.current.addToCart("prod-1", 1, { name: "Ube Jam", price: 100 });
    });

    expect(mockAddItem).toHaveBeenCalledWith({ productId: "prod-1", quantity: 1 }, "token-123");
    expect(useCartStore.getState().isOpen).toBe(false);
    expect(result.current.totalItems).toBe(1);
  });
});
