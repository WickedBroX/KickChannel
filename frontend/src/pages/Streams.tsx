import { useEffect, useState } from 'react';
import client from '../api/client';

export const Streams = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/streams').then(res => setStreams(res.data.streams)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Live Streams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map(stream => (
          <div key={stream.id} className="bg-dark-900 rounded-xl overflow-hidden border border-gray-800 hover:border-primary-500 transition-colors cursor-pointer">
             <div className="relative aspect-video bg-black">
                {stream.is_live && <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">LIVE</div>}
                <img src={stream.thumbnail_url} alt={stream.title} className="w-full h-full object-cover"/>
             </div>
             <div className="p-4">
               <h3 className="font-bold text-lg truncate">{stream.title}</h3>
               <p className="text-primary-400 text-sm mb-2">{stream.streamer_name}</p>
               <div className="flex justify-between text-sm text-gray-500">
                  <span>{stream.game}</span>
                  <span>{stream.views} views</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
