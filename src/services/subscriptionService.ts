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
    if (!window.LemonSqueezy) {
      // Eğer script henüz yüklenmediyse doğrudan yönlendir
      const url = new URL(checkoutUrl);
      url.searchParams.append('checkout[custom][firebaseUID]', userId);
      window.location.href = url.toString();
      return;
    }

    // Overlay modunda aç
    // Custom veriyi URL'e ekleyerek Lemon Squeezy'nin tanımasını sağlıyoruz
    const url = new URL(checkoutUrl);
    url.searchParams.append('checkout[custom][firebaseUID]', userId);
    
    window.LemonSqueezy.Url.Open(url.toString());
  }

  /**
   * Billing Portal (Lemon Squeezy'de genelde her kullanıcının özel bir portal linki olur)
   */
  static async openCustomerPortal(): Promise<void> {
    alert('Please check your email from Lemon Squeezy to manage your subscription or contact support.');
  }
}
