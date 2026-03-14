import { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { LogIn, KeyRound } from 'lucide-react';

export const Login = () => {
  const users = useStore(state => state.users);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const navigate = useNavigate();

  const [selectedUser, setSelectedUser] = useState(users[0]?.id || '');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.id === selectedUser);
    if (!user) {
      setError('ユーザーを選択してください');
      return;
    }

    if (user.pin === pin) {
      setCurrentUser(user);
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } else {
      setError('PINコードが間違っています');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="flex flex-col items-center mb-8">
        <div className="bg-green-100 p-3 rounded-full mb-4">
          <LogIn className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">ログイン</h2>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            作業者を選択
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            4桁のPINコード
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <KeyRound className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0)).replace(/[^0-9]/g, '');
                setPin(val);
                setError('');
              }}
              placeholder="0000"
              className="w-full border border-gray-300 rounded-lg py-3 pl-10 pr-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition tracking-[0.5em] text-lg font-mono"
              required
            />
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg shadow transition duration-200 mt-4"
        >
          ログイン
        </button>
      </form>
    </div>
  );
};
