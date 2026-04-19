declare global {
  interface Window {
    LemonSqueezy: any;
  }
}

export class SubscriptionService {
  /**
   * Initialize LemonSqueezy (Overlay kurulumu)
   */
  static async initialize(): Promise<void> {
    if (window.LemonSqueezy) {
      window.LemonSqueezy.Setup({
        eventHandler: (event: any) => {
          if (event.event === 'Checkout.Success') {
            console.log('Lemon Squeezy Checkout Success');
          }
        }
      });
    }
  }

  /**
   * Open Lemon Squeezy Checkout
   * @param userId Firebase User ID (metadataya eklenecek)
   * @param checkoutUrl Lemon Squeezy Store'dan alınan checkout linki
   */
  static async openCheckout(userId: string, checkoutUrl: string): Promise<void> {
    try {
      if (!checkoutUrl) {
        throw new Error('Checkout URL is missing!');
      }

      // URL'i manuel oluşturuyoruz çünkü Lemon Squeezy kodlanmış parantezleri (%5B %5D) bazen tanımıyor.
      const separator = checkoutUrl.includes('?') ? '&' : '?';
      const redirectUrl = encodeURIComponent(`${window.location.origin}/dashboard`);
      
      const finalUrl = `${checkoutUrl}${separator}checkout[custom][user_id]=${userId}&checkout[settings][redirect_url]=${redirectUrl}`;
      
      console.log('Redirecting to checkout (manual URL):', finalUrl);
      window.location.href = finalUrl;
    } catch (error) {
      console.error('Error in openCheckout:', error);
      window.location.href = checkoutUrl;
    }
  }

  /**
   * Billing Portal (Lemon Squeezy'de genelde her kullanıcının özel bir portal linki olur)
   */
  static async openCustomerPortal(): Promise<void> {
    alert('Please check your email from Lemon Squeezy to manage your subscription or contact support.');
  }
}
