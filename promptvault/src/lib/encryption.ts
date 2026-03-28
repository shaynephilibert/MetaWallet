import CryptoJS from 'crypto-js';

export function encrypt(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString();
}

export function decrypt(ciphertext: string, password: string): string | null {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    if (!result) return null;
    return result;
  } catch {
    return null;
  }
}
