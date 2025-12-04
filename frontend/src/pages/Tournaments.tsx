import { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Tournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    client.get('/tournaments').then(res => setTournaments(res.data.tournaments)).finally(() => setLoading(false));
  }, []);

  const join = async (offerId: string) => {
    try {
      const res = await client.post('/ticket-offers/redeem', { offerId });
      setMsg(res.data.message);
      setError('');
      setTimeout(() => setMsg(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join');
      setMsg('');
      setTimeout(() => setError(''), 5000);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tournaments</h1>

      {(msg || error) && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded shadow-lg ${msg ? 'bg-green-600' : 'bg-red-600'}`}>
          {msg || error}
        </div>
      )}

      <div className="space-y-4">
        {tournaments.map(t => (
          <div key={t.id} className="bg-dark-900 rounded-xl border border-gray-800 overflow-hidden flex flex-col md:flex-row">
             <div className="md:w-1/3 h-48 md:h-auto relative bg-dark-800">
               {t.banner_image_url ? (
                  <img src={t.banner_image_url} alt={t.name} className="w-full h-full object-cover"/>
               ) : (
                  <div className="flex items-center justify-center h-full text-gray-700">
                    <Trophy className="w-16 h-16"/>
                  </div>
               )}
             </div>
             <div className="p-6 flex-1 flex flex-col">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold">{t.name}</h3>
                    <p className="text-primary-400 mb-2">{t.game}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                    t.status === 'upcoming' ? 'bg-blue-600/20 text-blue-500' :
                    t.status === 'ongoing' ? 'bg-green-600/20 text-green-500' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {t.status}
                  </span>
               </div>

               <p className="text-gray-400 mb-4">{t.description}</p>

               <div className="flex space-x-6 text-sm text-gray-400 mb-6">
                 <div className="flex items-center"><Calendar className="w-4 h-4 mr-2"/> {new Date(t.start_date).toLocaleDateString()}</div>
                 <div className="flex items-center"><Trophy className="w-4 h-4 mr-2"/> Pool: ${t.prize_pool}</div>
               </div>

               <div className="mt-auto pt-4 border-t border-gray-800">
                 <h4 className="font-bold mb-2 text-sm uppercase text-gray-500">Tickets / Entry</h4>
                 <div className="flex flex-wrap gap-4">
                   {t.offers && t.offers.length > 0 ? (
                     t.offers.map((offer: any) => (
                       <div key={offer.id} className="flex items-center bg-dark-800 rounded-lg p-2 border border-gray-700">
                          <div className="mr-4">
                            <span className="block font-bold">{offer.name}</span>
                            <span className="text-xs text-yellow-500">
                              {offer.price_points ? `${offer.price_points} pts` : ''}
                              {offer.price_points && offer.price_tickets ? ' + ' : ''}
                              {offer.price_tickets ? `${offer.price_tickets} tix` : ''}
                            </span>
                          </div>
                          <button
                            onClick={() => join(offer.id)}
                            className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1 rounded text-sm font-bold"
                          >
                            Join
                          </button>
                       </div>
                     ))
                   ) : (
                     <span className="text-gray-500 text-sm">No tickets available yet.</span>
                   )}
                 </div>
                 {!user?.telegram_verified && (
                   <div className="mt-2 text-xs text-yellow-500 flex items-center">
                     <AlertCircle className="w-3 h-3 mr-1"/> You must <Link to="/profile" className="underline ml-1">verify Telegram</Link> to join.
                   </div>
                 )}
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
