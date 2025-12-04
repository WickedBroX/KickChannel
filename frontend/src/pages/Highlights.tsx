import { useEffect, useState } from 'react';
import client from '../api/client';
import { Play } from 'lucide-react';

export const Highlights = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/highlights').then(res => setHighlights(res.data.highlights)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Best Moments</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {highlights.map(h => (
          <div key={h.id} className="bg-dark-900 rounded-xl overflow-hidden border border-gray-800 hover:border-primary-500 transition-colors group cursor-pointer">
             <div className="relative aspect-video bg-black">
                <img src={h.thumbnail_url} alt={h.title} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white fill-current"/>
                </div>
             </div>
             <div className="p-4">
               <h3 className="font-bold text-lg truncate">{h.title}</h3>
               <p className="text-gray-400 text-sm mb-2">{h.description}</p>
               <div className="flex justify-between text-sm text-gray-500">
                  <span>{h.views} views</span>
                  <span>{h.likes} likes</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
