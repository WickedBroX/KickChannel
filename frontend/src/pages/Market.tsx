import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Loader2 } from 'lucide-react';

export const Market = () => {
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{code: string, itemName: string} | null>(null);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [iRes, pRes] = await Promise.all([
        client.get('/market/items'),
        client.get('/market/my-purchases')
      ]);
      setItems(iRes.data.items);
      setPurchases(pRes.data.purchases);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBuy = async (item: any) => {
    if (user!.points < item.price_points) {
      setError('Not enough points');
      return;
    }
    setBuyingId(item.id);
    setError('');
    try {
      const res = await client.post(`/market/items/${item.id}/purchase`);
      setSuccessData({ code: res.data.code, itemName: res.data.itemName });
      refreshUser();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading market...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="bg-dark-900 px-4 py-2 rounded border border-gray-700">
           <span className="text-gray-400 mr-2">Your Points:</span>
           <span className="text-primary-500 font-bold text-xl">{user?.points}</span>
        </div>
      </div>

      {error && <div className="bg-red-500/10 text-red-500 p-4 rounded border border-red-500/20">{error}</div>}

      {successData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 p-8 rounded-xl border border-primary-500 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-green-500 mb-2">Purchase Successful!</h2>
            <p className="text-gray-300 mb-4">You have purchased <strong>{successData.itemName}</strong>.</p>
            <div className="bg-black/50 p-4 rounded mb-6 border border-gray-700 font-mono text-xl tracking-wider select-all">
              {successData.code}
            </div>
            <button
              onClick={() => setSuccessData(null)}
              className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="bg-dark-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col group hover:border-gray-600 transition-colors">
            <div className="h-40 bg-dark-800 flex items-center justify-center relative overflow-hidden">
               {item.image_url ? (
                 <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
               ) : (
                 <ShoppingBag className="w-12 h-12 text-gray-700"/>
               )}
               {item.stock_quantity !== null && (
                 <div className="absolute top-2 right-2 bg-black/70 text-xs px-2 py-1 rounded">
                   {item.stock_quantity} left
                 </div>
               )}
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-1">{item.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1 line-clamp-2">{item.description}</p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-primary-400 font-bold">{item.price_points} pts</span>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={buyingId === item.id || (item.stock_quantity !== null && item.stock_quantity <= 0)}
                  className="bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded text-sm font-bold transition-colors"
                >
                  {buyingId === item.id ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Buy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">My Purchases</h2>
        <div className="bg-dark-900 rounded-xl border border-gray-800 overflow-hidden">
           {purchases.length === 0 ? (
             <div className="p-6 text-gray-500">No purchases yet.</div>
           ) : (
             <table className="w-full text-left">
               <thead className="bg-dark-800 text-gray-400 text-sm">
                 <tr>
                   <th className="p-4">Item</th>
                   <th className="p-4">Code</th>
                   <th className="p-4">Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-800">
                 {purchases.map(p => (
                   <tr key={p.id}>
                     <td className="p-4 font-medium">{p.item_name}</td>
                     <td className="p-4 font-mono text-primary-400 select-all">{p.code}</td>
                     <td className="p-4 text-gray-500 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
        </div>
      </div>
    </div>
  );
};
