declare global {
  interface Window {
    Paddle: any;
  }
}

export class SubscriptionService {
  private static PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN || 'test_token_placeholder';

  /**
   * Initialize Paddle.js
   */
  static async initialize(): Promise<void> {
    if (window.Paddle) {
      window.Paddle.Initialize({ 
        token: this.PADDLE_CLIENT_TOKEN
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
  static async openCustomerPortal(): Promise<void> {
    alert('Please check your email from Paddle to manage your subscription.');
  }
}
