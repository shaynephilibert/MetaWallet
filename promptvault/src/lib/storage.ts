import { encrypt, decrypt } from './encryption';

export interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  createdAt: number;
}

export interface VaultData {
  prompts: Prompt[];
  categories: string[];
}

const STORAGE_KEY = 'promptvault_data';

export async function saveVault(data: VaultData, password: string): Promise<void> {
  const encrypted = encrypt(JSON.stringify(data), password);
  await chrome.storage.local.set({ [STORAGE_KEY]: encrypted });
}

export async function loadVault(password: string): Promise<VaultData | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  if (!result[STORAGE_KEY]) {
    return { prompts: [], categories: ['General', 'Writing', 'Coding', 'Research'] };
  }
  const decrypted = decrypt(result[STORAGE_KEY] as string, password);
  if (!decrypted) return null;
  return JSON.parse(decrypted) as VaultData;
}

export async function vaultExists(): Promise<boolean> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return !!result[STORAGE_KEY];
}
