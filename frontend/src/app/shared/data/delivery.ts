/**
 * Delivery pricing rule, in one place.
 *
 * These two numbers used to live as private constants inside the checkout's OrderSummary,
 * which is the only place that *charges* delivery — and still is. They moved here unchanged
 * so the cart drawer can tell a shopper how close they are to free delivery without either
 * screen re-stating the threshold from memory. The arithmetic that decides what a customer
 * actually pays remains in OrderSummary; everything here is read-only reference data.
 */
export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 40;

/** How much more is needed to cross the free-delivery line, or 0 once it's been crossed. */
export function amountToFreeDelivery(subtotal: number): number {
  return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
}
