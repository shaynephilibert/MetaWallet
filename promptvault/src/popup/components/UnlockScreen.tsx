import { useState } from 'react';

interface Props {
  onUnlock: (password: string) => Promise<boolean>;
}

export default function UnlockScreen({ onUnlock }: Props) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await onUnlock(pw);
    if (!ok) {
      setError('Wrong password. Try again.');
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-950 px-6">
      <div className="mb-6 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h1 className="text-xl font-bold text-white">PromptVault</h1>
        <p className="text-sm text-gray-400 mt-1">Enter your password to unlock</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
        >
          {loading ? 'Unlocking…' : 'Unlock'}
        </button>
      </form>
    </div>
  );
}
