import { useState } from 'react';

interface Props {
  onSet: (password: string) => void;
}

export default function SetPasswordScreen({ onSet }: Props) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (pw !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    onSet(pw);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-950 px-6">
      <div className="mb-6 text-center">
        <div className="text-3xl mb-2">🔒</div>
        <h1 className="text-xl font-bold text-white">PromptVault</h1>
        <p className="text-sm text-gray-400 mt-1">Create a password to encrypt your prompts</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white text-sm placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-violet-500"
        />
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
        >
          Create Vault
        </button>
      </form>

      <p className="text-xs text-gray-600 mt-6 text-center max-w-xs">
        Your password never leaves your device. If you forget it, your data cannot be recovered.
      </p>
    </div>
  );
}
