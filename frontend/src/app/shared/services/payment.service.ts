import { Injectable } from '@angular/core';

export interface RazorpayGatewayInfo {
  readonly keyId: string;
  readonly gatewayOrderId: string;
  readonly currency: string;
  readonly amountInSmallestUnit: number;
}

export interface RazorpayPaymentResult {
  readonly razorpayOrderId: string;
  readonly razorpayPaymentId: string;
  readonly razorpaySignature: string;
}

interface RazorpayCheckoutResponse {
  readonly razorpay_order_id: string;
  readonly razorpay_payment_id: string;
  readonly razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  prefill?: { name?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayCheckoutInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  openCheckout(gateway: RazorpayGatewayInfo, prefill: { name: string; contact: string }): Promise<RazorpayPaymentResult> {
    return new Promise((resolve, reject) => {
      const options: RazorpayCheckoutOptions = {
        key: gateway.keyId,
        amount: gateway.amountInSmallestUnit,
        currency: gateway.currency,
        order_id: gateway.gatewayOrderId,
        name: 'FreshOMill',
        prefill: { name: prefill.name, contact: prefill.contact },
        theme: { color: '#4553c4' },
        handler: (response) => {
          resolve({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled.')),
        },
      };

      new window.Razorpay(options).open();
    });
  }
}
