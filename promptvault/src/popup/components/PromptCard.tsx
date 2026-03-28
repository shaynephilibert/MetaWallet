import { useState } from 'react';
import { type Prompt } from '../../lib/storage';

interface Props {
  prompt: Prompt;
  onDelete: (id: string) => void;
  onEdit: (prompt: Prompt) => void;
  onDuplicate: (prompt: Prompt) => void;
  onInject: (prompt: Prompt) => void;
}

export default function PromptCard({ prompt, onDelete, onEdit, onDuplicate, onInject }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(prompt.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-white text-sm font-medium leading-tight">{prompt.title}</span>
        <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
          {prompt.category}
        </span>
      </div>
      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">
        {prompt.body.slice(0, 80)}{prompt.body.length > 80 ? '…' : ''}
      </p>
      <div className="flex gap-1.5">
        <button
          onClick={handleCopy}
          className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => onInject(prompt)}
          className="flex-1 py-1 rounded bg-violet-700 hover:bg-violet-600 text-white text-xs transition-colors"
        >
          Inject
        </button>
        <button
          onClick={() => onEdit(prompt)}
          className="py-1 px-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDuplicate(prompt)}
          className="py-1 px-2 rounded bg-gray-700 hover:bg-gray-600 text-gray-400 text-xs transition-colors"
          title="Duplicate"
        >
          ⧉
        </button>
        <button
          onClick={() => onDelete(prompt.id)}
          className="py-1 px-2 rounded bg-gray-700 hover:bg-red-900/50 text-gray-500 hover:text-red-400 text-xs transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
