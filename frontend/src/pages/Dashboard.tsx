import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { Link } from 'react-router-dom';
import { Gift, Trophy, ShoppingBag } from 'lucide-react';

export const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [dailyLoading, setDailyLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const claimDaily = async () => {
    setDailyLoading(true);
    try {
      const res = await client.post('/rewards/daily-login');
      setMsg(res.data.message);
      refreshUser();
    } catch (error: any) {
      setMsg(error.response?.data?.message || 'Error claiming');
    } finally {
      setDailyLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome back, {user?.username}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-center">
          <span className="text-gray-400">Total Points</span>
          <span className="text-4xl font-bold text-primary-500">{user?.points}</span>
        </div>
        <div className="bg-dark-900 p-6 rounded-xl border border-gray-800 flex flex-col justify-center">
          <span className="text-gray-400">Tickets</span>
          <span className="text-4xl font-bold text-yellow-500">{user?.tickets}</span>
        </div>

        <div className="bg-gradient-to-br from-primary-900/50 to-dark-900 p-6 rounded-xl border border-primary-500/30 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center"><Gift className="mr-2"/> Daily Reward</h3>
            <p className="text-sm text-gray-300">Claim your daily points and tickets!</p>
          </div>
          <div className="mt-4">
            {msg && <p className="text-sm mb-2 text-primary-300">{msg}</p>}
            <button
              onClick={claimDaily}
              disabled={dailyLoading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 py-2 rounded font-bold"
            >
              {dailyLoading ? 'Claiming...' : 'Claim Reward'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         <Link to="/market" className="bg-dark-900 p-6 rounded-xl border border-gray-800 hover:border-primary-500 transition-colors group">
            <ShoppingBag className="w-8 h-8 text-primary-500 mb-4 group-hover:scale-110 transition-transform"/>
            <h3 className="text-xl font-bold">Marketplace</h3>
            <p className="text-gray-400 text-sm mt-2">Spend points on exclusive digital rewards.</p>
         </Link>
         <Link to="/fortune-wheel" className="bg-dark-900 p-6 rounded-xl border border-gray-800 hover:border-primary-500 transition-colors group">
            <Gift className="w-8 h-8 text-pink-500 mb-4 group-hover:rotate-12 transition-transform"/>
            <h3 className="text-xl font-bold">Fortune Wheel</h3>
            <p className="text-gray-400 text-sm mt-2">Spin daily to win massive point prizes.</p>
         </Link>
         <Link to="/tournaments" className="bg-dark-900 p-6 rounded-xl border border-gray-800 hover:border-primary-500 transition-colors group">
            <Trophy className="w-8 h-8 text-yellow-500 mb-4 group-hover:scale-110 transition-transform"/>
            <h3 className="text-xl font-bold">Tournaments</h3>
            <p className="text-gray-400 text-sm mt-2">Join events and compete for glory.</p>
         </Link>
      </div>
    </div>
  );
};
