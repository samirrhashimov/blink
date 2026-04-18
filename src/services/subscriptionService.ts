declare global {
  interface Window {
    Paddle: any;
  }
}

export class SubscriptionService {
  private static PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token_placeholder';
  private static PADDLE_ENV = (import.meta.env.VITE_PADDLE_ENV || 'sandbox') as 'sandbox' | 'production';

  /**
   * Initialize Paddle.js
   */
  static async initialize(): Promise<void> {
    if (window.Paddle) {
      window.Paddle.Initialize({ 
        token: this.PADDLE_CLIENT_TOKEN,
        environment: this.PADDLE_ENV
      });
    }
  }

  /**
   * Open Paddle Checkout
   */
  static async openCheckout(userId: string, email: string, priceId: string): Promise<void> {
    if (!window.Paddle) {
      console.error('Paddle.js not loaded');
      return;
    }

    window.Paddle.Checkout.open({
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en'
      },
      customer: {
        email: email
      },
      items: [
        {
          priceId: priceId,
          quantity: 1
        }
      ],
      customData: {
        firebaseUID: userId
      }
    });
  }

  /**
   * Handle Billing Portal / Cancel
   * Paddle Billing uses standard links or the customer portal
   */
  static async openCustomerPortal(customerId: string): Promise<void> {
    // Note: For Paddle Billing, you usually generate a portal URL via Backend 
    // or use their standard management URLs if enabled.
    // For now, we'll suggest using the backend to get a URL if needed, 
    // or direct them to their Paddle email management.
    alert('Subscription management is available via the link in your email or contact support.');
  }
}
