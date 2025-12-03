import { useState } from 'react';
import client from '../api/client';

export const Admin = () => {
  const [activeTab, setActiveTab] = useState('market');
  const [msg, setMsg] = useState('');

  const Tabs = () => (
    <div className="flex space-x-4 border-b border-gray-800 mb-6">
      {['market', 'tournaments', 'rewards'].map(tab => (
        <button
          key={tab}
          onClick={() => { setActiveTab(tab); setMsg(''); }}
          className={`px-4 py-2 capitalize font-bold ${activeTab === tab ? 'text-primary-500 border-b-2 border-primary-500' : 'text-gray-400'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const MarketForm = () => {
    const [formData, setFormData] = useState({ name: '', description: '', price_points: 0, image_url: '' });
    const [codes, setCodes] = useState('');
    const [itemId, setItemId] = useState('');

    const createItem = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await client.post('/admin/market-items', formData);
        setMsg(`Item created: ${res.data.item.id}`);
        setItemId(res.data.item.id);
      } catch (err) { alert('Error'); }
    };

    const addCodes = async (e: React.FormEvent) => {
      e.preventDefault();
      const codeList = codes.split(',').map(c => c.trim()).filter(c => c);
      try {
        await client.post('/admin/market-items/grants', { marketItemId: itemId, codes: codeList });
        setMsg('Codes added');
        setCodes('');
      } catch (err) { alert('Error'); }
    };

    return (
      <div className="space-y-8">
        <form onSubmit={createItem} className="space-y-4 max-w-md">
          <h3 className="text-xl font-bold">Create Market Item</h3>
          <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required/>
          <textarea className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} required/>
          <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Price (Points)" onChange={e => setFormData({...formData, price_points: parseInt(e.target.value)})} required/>
          <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Image URL" onChange={e => setFormData({...formData, image_url: e.target.value})} />
          <button className="bg-primary-600 px-4 py-2 rounded text-white font-bold">Create Item</button>
        </form>

        <form onSubmit={addCodes} className="space-y-4 max-w-md border-t border-gray-800 pt-8">
          <h3 className="text-xl font-bold">Add Codes to Item</h3>
          <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Item ID" value={itemId} onChange={e => setItemId(e.target.value)} required/>
          <textarea className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Codes (comma separated)" value={codes} onChange={e => setCodes(e.target.value)} required/>
          <button className="bg-primary-600 px-4 py-2 rounded text-white font-bold">Add Codes</button>
        </form>
      </div>
    );
  };

  const TournamentForm = () => {
      const [formData, setFormData] = useState({ name: '', description: '', game: '', prize_pool: 0, start_date: '', banner_image_url: '' });
      const [offerData, setOfferData] = useState({ tournament_id: '', name: 'General Admission', price_points: 0, price_tickets: 0, quantity: 100 });

      const createT = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
              const res = await client.post('/admin/tournaments', formData);
              setMsg(`Tournament created: ${res.data.tournament.id}`);
              setOfferData({...offerData, tournament_id: res.data.tournament.id});
          } catch (err) { alert('Error'); }
      };

      const createO = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
              await client.post('/admin/ticket-offers', {
                  ...offerData,
                  quantity_available: offerData.quantity
              });
              setMsg('Ticket Offer added');
          } catch (err) { alert('Error'); }
      };

      return (
        <div className="space-y-8">
            <form onSubmit={createT} className="space-y-4 max-w-md">
                <h3 className="text-xl font-bold">Create Tournament</h3>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Name" onChange={e => setFormData({...formData, name: e.target.value})} required/>
                <textarea className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} required/>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Game" onChange={e => setFormData({...formData, game: e.target.value})} required/>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Prize Pool" onChange={e => setFormData({...formData, prize_pool: parseInt(e.target.value)})} />
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="date" placeholder="Start Date" onChange={e => setFormData({...formData, start_date: e.target.value})} required/>
                <button className="bg-primary-600 px-4 py-2 rounded text-white font-bold">Create Tournament</button>
            </form>

            <form onSubmit={createO} className="space-y-4 max-w-md border-t border-gray-800 pt-8">
                <h3 className="text-xl font-bold">Add Ticket Offer</h3>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Tournament ID" value={offerData.tournament_id} onChange={e => setOfferData({...offerData, tournament_id: e.target.value})} required/>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Offer Name" value={offerData.name} onChange={e => setOfferData({...offerData, name: e.target.value})} required/>
                <div className="flex gap-2">
                    <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Cost Points" onChange={e => setOfferData({...offerData, price_points: parseInt(e.target.value)})} />
                    <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Cost Tickets" onChange={e => setOfferData({...offerData, price_tickets: parseInt(e.target.value)})} />
                </div>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Quantity" value={offerData.quantity} onChange={e => setOfferData({...offerData, quantity: parseInt(e.target.value)})} />
                <button className="bg-primary-600 px-4 py-2 rounded text-white font-bold">Add Offer</button>
            </form>
        </div>
      );
  };

  const RewardForm = () => {
      const [formData, setFormData] = useState({ code: '', description: '', points_reward: 0, tickets_reward: 0, max_uses: 1 });
      const create = async (e: React.FormEvent) => {
          e.preventDefault();
          try {
              await client.post('/admin/code-rewards', { ...formData, max_uses_per_user: 1, global_max_uses: formData.max_uses });
              setMsg('Reward created');
          } catch (err) { alert('Error'); }
      };

      return (
          <form onSubmit={create} className="space-y-4 max-w-md">
                <h3 className="text-xl font-bold">Create Code Reward</h3>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Code (e.g. WELCOME)" onChange={e => setFormData({...formData, code: e.target.value})} required/>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} required/>
                <div className="flex gap-2">
                    <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Points" onChange={e => setFormData({...formData, points_reward: parseInt(e.target.value)})} />
                    <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Tickets" onChange={e => setFormData({...formData, tickets_reward: parseInt(e.target.value)})} />
                </div>
                <input className="w-full bg-dark-800 p-2 rounded border border-gray-700" type="number" placeholder="Global Max Uses" onChange={e => setFormData({...formData, max_uses: parseInt(e.target.value)})} />
                <button className="bg-primary-600 px-4 py-2 rounded text-white font-bold">Create Reward</button>
          </form>
      );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      {msg && <div className="bg-green-500/10 text-green-500 p-4 mb-4 rounded border border-green-500/30">{msg}</div>}
      <Tabs />
      {activeTab === 'market' && <MarketForm />}
      {activeTab === 'tournaments' && <TournamentForm />}
      {activeTab === 'rewards' && <RewardForm />}
    </div>
  );
};
