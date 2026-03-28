import { encrypt, decrypt } from './encryption';

export interface Prompt {
  id: string;
  title: string;
  body: string;
  category: string;
  tags: string[];
  pinned: boolean;
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

export function exportVault(data: VaultData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `promptvault-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importPrompts(
  file: File,
  existing: VaultData,
  onComplete: (merged: VaultData) => void,
  onError: (msg: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const parsed = JSON.parse(e.target?.result as string) as VaultData;
      if (!Array.isArray(parsed.prompts)) throw new Error('Invalid format');

      // Merge: skip prompts whose id already exists
      const existingIds = new Set(existing.prompts.map((p) => p.id));
      const newPrompts = parsed.prompts.filter((p) => !existingIds.has(p.id));
      const newCategories = parsed.categories?.filter(
        (c) => !existing.categories.includes(c)
      ) ?? [];

      onComplete({
        prompts: [...existing.prompts, ...newPrompts],
        categories: [...existing.categories, ...newCategories],
      });
    } catch {
      onError('Could not parse file. Make sure it is a valid PromptVault export.');
    }
  };
  reader.readAsText(file);
}
