import { useState } from 'react';
import { type VaultData, type Prompt } from '../../lib/storage';
import CategoryFilter from './CategoryFilter';
import PromptCard from './PromptCard';
import AddPromptModal from './AddPromptModal';
import EditPromptModal from './EditPromptModal';
import UpgradeModal from './UpgradeModal';

const FREE_PROMPT_LIMIT = 15;
const FREE_CATEGORY_LIMIT = 3;

interface Props {
  vault: VaultData;
  paid: boolean;
  onVaultChange: (updated: VaultData) => void;
}

type UpgradeReason = 'prompts' | 'categories' | 'injection';

export default function MainScreen({ vault, paid, onVaultChange }: Props) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [search, setSearch] = useState('');
  const [injectStatus, setInjectStatus] = useState<string | null>(null);

  const canAddPrompt = paid || vault.prompts.length < FREE_PROMPT_LIMIT;
  const canAddCategory = paid || vault.categories.length < FREE_CATEGORY_LIMIT;

  const filtered = vault.prompts.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.body.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleAddClick() {
    if (!canAddPrompt) {
      setUpgradeReason('prompts');
      return;
    }
    setShowAddModal(true);
  }

  function handleAdd(data: Omit<Prompt, 'id' | 'createdAt'>) {
    const newPrompt: Prompt = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    const isNewCategory = !vault.categories.includes(data.category);
    const categories = isNewCategory
      ? [...vault.categories, data.category]
      : vault.categories;
    onVaultChange({ ...vault, prompts: [...vault.prompts, newPrompt], categories });
  }

  function handleDelete(id: string) {
    onVaultChange({ ...vault, prompts: vault.prompts.filter((p) => p.id !== id) });
  }

  function handleEdit(updated: Prompt) {
    onVaultChange({
      ...vault,
      prompts: vault.prompts.map((p) => (p.id === updated.id ? updated : p)),
    });
  }

  async function handleInject(prompt: Prompt) {
    // Resolve variables in paid plan
    let text = prompt.body;
    if (paid) {
      const vars = [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]);
      if (vars.length > 0) {
        for (const v of vars) {
          const val = window.prompt(`Value for {{${v}}}:`);
          if (val !== null) text = text.replaceAll(`{{${v}}}`, val);
        }
      }
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id || !tab.url) return;

      const url = tab.url;
      const isChatGPT = url.includes('chatgpt.com');
      const isClaude = url.includes('claude.ai');
      const isGemini = url.includes('gemini.google.com');
      const isGrok = url.includes('grok.com');

      const isPaidPlatform = isClaude || isGemini || isGrok;

      if (isPaidPlatform && !paid) {
        setUpgradeReason('injection');
        return;
      }

      if (!isChatGPT && !isClaude && !isGemini && !isGrok) {
        setInjectStatus('Navigate to ChatGPT, Claude, Gemini, or Grok first');
        setTimeout(() => setInjectStatus(null), 2500);
        return;
      }

      await chrome.tabs.sendMessage(tab.id, { type: 'INJECT_PROMPT', prompt: text });
      setInjectStatus('Injected!');
      setTimeout(() => setInjectStatus(null), 1500);
    } catch {
      setInjectStatus('Injection failed — reload the page and try again');
      setTimeout(() => setInjectStatus(null), 3000);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-[500px] max-h-[600px] bg-gray-950">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white font-bold text-base">PromptVault</h1>
          <div className="flex items-center gap-2">
            {!paid && (
              <span className="text-xs text-gray-500">
                {vault.prompts.length}/{FREE_PROMPT_LIMIT} prompts
              </span>
            )}
            <button
              onClick={handleAddClick}
              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search prompts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500 mb-2"
        />

        <CategoryFilter
          categories={vault.categories}
          active={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {/* Inject status toast */}
      {injectStatus && (
        <div className="mx-4 mb-2 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs text-center">
          {injectStatus}
        </div>
      )}

      {/* Prompt list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-gray-600 text-sm">
              {search ? 'No prompts match your search.' : 'No prompts yet. Add one to get started.'}
            </p>
          </div>
        ) : (
          filtered.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              onDelete={handleDelete}
              onEdit={setEditingPrompt}
              onInject={handleInject}
            />
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPromptModal
          categories={vault.categories}
          canAddCategory={canAddCategory}
          onAdd={handleAdd}
          onUpgrade={() => { setShowAddModal(false); setUpgradeReason('categories'); }}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingPrompt && (
        <EditPromptModal
          prompt={editingPrompt}
          categories={vault.categories}
          onSave={handleEdit}
          onClose={() => setEditingPrompt(null)}
        />
      )}
      {upgradeReason && (
        <UpgradeModal
          reason={upgradeReason}
          onClose={() => setUpgradeReason(null)}
        />
      )}
    </div>
  );
}
