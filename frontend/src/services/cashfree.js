/**
 * Cashfree Payments Web Checkout Service (SDK v3)
 * Provides seamless modal and redirect-based checkout for UPI, Cards, NetBanking, and Wallets.
 */

export const loadCashfreeSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      resolve(window.Cashfree);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
      } else {
        reject(new Error('Cashfree SDK failed to initialize'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Cashfree checkout script'));
    };
    document.head.appendChild(script);
  });
};

export const initiateCashfreeCheckout = async ({
  paymentSessionId,
  environment = 'sandbox',
  redirectTarget = '_self', // '_self' for redirect or '_modal' for modal popup
  onSuccess,
  onFailure
}) => {
  try {
    const CashfreeConstructor = await loadCashfreeSDK();
    const mode = environment?.toLowerCase() === 'production' ? 'production' : 'sandbox';
    
    const cashfree = CashfreeConstructor({
      mode: mode,
    });

    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      redirectTarget: redirectTarget,
    };

    const response = await cashfree.checkout(checkoutOptions);

    if (response?.error) {
      console.warn('Cashfree payment error/drop:', response.error);
      if (onFailure) onFailure(response.error);
      return { success: false, error: response.error };
    }

    if (response?.paymentDetails) {
      if (onSuccess) onSuccess(response.paymentDetails);
      return { success: true, paymentDetails: response.paymentDetails };
    }

    return { success: true, redirect: response?.redirect };
  } catch (error) {
    console.error('Failed to initiate Cashfree checkout:', error);
    if (onFailure) onFailure(error);
    throw error;
  }
};
