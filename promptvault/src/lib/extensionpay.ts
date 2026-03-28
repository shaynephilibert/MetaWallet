// Replace 'your-extension-id-here' with your actual ExtensionPay extension ID
// after registering at https://extensionpay.com
import ExtPay from 'extpay';

export const EXTENSION_ID = 'testiop';

export const extpay = ExtPay(EXTENSION_ID);

export async function isPaidUser(): Promise<boolean> {
  try {
    const user = await extpay.getUser();
    return user.paid;
  } catch {
    return false;
  }
}

export function openPaymentPage(): void {
  extpay.openPaymentPage();
}
