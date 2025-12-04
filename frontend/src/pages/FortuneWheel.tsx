import { useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export const FortuneWheel = () => {
  const { refreshUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{points: number, name: string} | null>(null);
  const [error, setError] = useState('');

  const spin = async () => {
    setSpinning(true);
    setError('');
    setResult(null);

    // Animation fake time
    setTimeout(async () => {
        try {
            const res = await client.post('/rewards/fortune-spin');
            setResult({ points: res.data.pointsAwarded, name: res.data.prizeName });
            refreshUser();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error spinning');
        } finally {
            setSpinning(false);
        }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
       <h1 className="text-4xl font-bold">Daily Fortune Wheel</h1>
       <p className="text-gray-400">Spin once every 24 hours to win free points!</p>

       <div className="relative">
          <motion.div
            animate={spinning ? { rotate: 360 * 5 } : { rotate: 0 }}
            transition={spinning ? { duration: 2, ease: "easeInOut" } : { duration: 0 }}
            className="w-64 h-64 rounded-full border-4 border-primary-500 bg-dark-800 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)]"
          >
             <Gift className="w-24 h-24 text-primary-500" />
          </motion.div>

          {/* Pointer */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-t-[30px] border-t-yellow-500 border-r-[15px] border-r-transparent z-10"></div>
       </div>

       {result && (
         <div className="text-center animate-bounce">
            <h2 className="text-2xl font-bold text-yellow-500">You Won {result.points} Points!</h2>
            <p className="text-gray-300">({result.name})</p>
         </div>
       )}

       {error && <p className="text-red-500 bg-red-500/10 px-4 py-2 rounded">{error}</p>}

       <button
         onClick={spin}
         disabled={spinning}
         className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white px-8 py-3 rounded-full text-xl font-bold transition-all transform hover:scale-105"
       >
         {spinning ? 'Spinning...' : 'SPIN NOW'}
       </button>
    </div>
  );
};
