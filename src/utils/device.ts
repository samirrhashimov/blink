export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Android ve iOS tespiti
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Ekran genişliği kontrolü (Opsiyonel ama garanti olması için)
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobile || isSmallScreen;
};

/**
 * Kullanıcı mobildeyken ödeme kısımlarını göstermemek için politika kontrolü
 */
export const shouldHidePayments = () => {
  return isMobileDevice();
};
