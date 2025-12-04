import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [linkData, setLinkData] = useState<{link: string, linkToken: string} | null>(null);

  const redeem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await client.post('/rewards/redeem-code', { code });
      setMsg(res.data.message);
      setError('');
      setCode('');
      refreshUser();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error');
      setMsg('');
    }
  };

  const startTelegram = async () => {
    try {
      const res = await client.post('/telegram/link/start');
      setLinkData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <section className="bg-dark-900 p-6 rounded-xl border border-gray-800">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.username}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <div className="flex items-center mt-1 space-x-2">
              {user?.email_verified ? (
                <span className="text-green-500 text-xs flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Email Verified</span>
              ) : (
                <span className="text-yellow-500 text-xs flex items-center"><AlertCircle className="w-3 h-3 mr-1"/> Email Unverified</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Telegram Verification</h3>
        {user?.telegram_verified ? (
           <div className="bg-green-500/10 border border-green-500/30 p-4 rounded text-green-400 flex items-center">
             <CheckCircle className="mr-2"/> Your account is linked to Telegram.
           </div>
        ) : (
           <div>
             <p className="text-gray-400 mb-4">Link your Telegram account to participate in tournaments.</p>
             {!linkData ? (
               <button onClick={startTelegram} className="bg-[#229ED9] hover:bg-[#1f8dbf] text-white px-4 py-2 rounded font-bold transition-colors">
                 Connect Telegram
               </button>
             ) : (
               <div className="bg-dark-800 p-4 rounded border border-gray-700">
                 <p className="mb-2 text-sm">Open the link below in Telegram and click Start:</p>
                 <a href={linkData.link} target="_blank" rel="noreferrer" className="text-primary-400 underline break-all block mb-4">
                   {linkData.link}
                 </a>
                 <p className="text-xs text-gray-500">Waiting for verification... Refresh page after linking.</p>
                 <button onClick={refreshUser} className="mt-2 text-sm text-white bg-dark-700 px-3 py-1 rounded">
                   I have linked it
                 </button>
               </div>
             )}
           </div>
        )}
      </section>

      <section className="bg-dark-900 p-6 rounded-xl border border-gray-800">
        <h3 className="text-xl font-bold mb-4">Redeem Code</h3>
        <form onSubmit={redeem} className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="Enter code (e.g. WELCOME)"
            className="flex-1 bg-dark-800 border border-gray-700 rounded p-2 focus:outline-none focus:border-primary-500"
          />
          <button type="submit" className="bg-primary-600 hover:bg-primary-500 px-4 py-2 rounded font-bold">
            Redeem
          </button>
        </form>
        {msg && <p className="mt-2 text-green-500">{msg}</p>}
        {error && <p className="mt-2 text-red-500">{error}</p>}
      </section>
    </div>
  );
};
