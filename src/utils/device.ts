/**
 * Cihaz ve tarayıcı tespiti için yardımcı araçlar
 */

export const isMobileDevice = (): boolean => {
  // Ekran genişliği tespiti (Tabletler için genelde 768px sınırı kullanılır)
  const isSmallScreen = window.innerWidth <= 768;
  
  // User agent tespiti
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|operamini/i.test(userAgent);
  
  return isSmallScreen || isMobileUA;
};

/**
 * Kullanıcının App içinde (WebView) olup olmadığını kontrol eder.
 * Mobil tarayıcı (Chrome/Safari) ile Uygulama içindeki WebView'u ayırt eder.
 */
export const isAppWebView = (): boolean => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Android WebView tespiti (Genelde "wv" veya "version/4.0" içerir)
  const isAndroidWebView = /android/.test(userAgent) && /version/.test(userAgent);
  
  // iOS WebView tespiti (Safari olmayan ama Apple-WebKit kullananlar)
  // "Safari" kelimesini içermiyorsa ama "iPhone/iPad" ve "AppleWebKit" içeriyorsa genelde WebView'dur.
  const isIOSWebView = /(iphone|ipad|ipod)/.test(userAgent) && 
                       /applewebkit/.test(userAgent) && 
                       !/safari/.test(userAgent);

  // Standalone modu (PWA olarak ana ekrana eklenmişse)
  const isStandalone = (window.navigator as any).standalone || 
                       window.matchMedia('(display-mode: standalone)').matches;

  return isAndroidWebView || isIOSWebView || isStandalone;
};

/**
 * Kullanıcının ödeme yapabileceği bir ortamda olup olmadığını kontrol eder.
 * Mobil cihazda olsa bile, eğer WebView (App) içinde DEĞİLSE ödeme yapabilir (Chrome, Safari vb.).
 */
export const canShowPayments = (): boolean => {
  // Eğer masaüstündeyse zaten göster
  if (window.innerWidth > 768) return true;
  
  // Eğer mobildeyse ama App (WebView) içinde DEĞİLSE göster
  return !isAppWebView();
};
