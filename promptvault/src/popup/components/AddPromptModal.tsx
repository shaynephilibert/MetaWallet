import { useState } from 'react';
import { type Prompt } from '../../lib/storage';

interface Props {
  categories: string[];
  onAdd: (prompt: Omit<Prompt, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function AddPromptModal({ categories, onAdd, onClose }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'General');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    onAdd({ title: title.trim(), body: body.trim(), category });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end z-50">
      <div className="bg-gray-900 rounded-t-xl p-4 w-full border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Add Prompt</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
          />
          <textarea
            placeholder="Prompt body… use {{variable}} for variables (Pro)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500 resize-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm border border-gray-700 focus:outline-none focus:border-violet-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
