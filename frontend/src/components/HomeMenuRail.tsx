import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { money } from '../api';
import { useStore } from '../store';
import type { MenuItem } from '../types';

export default function HomeMenuRail({ items, onSelect }: { items: MenuItem[]; onSelect: (item: MenuItem) => void }) {
  const { favorites, toggleFavorite } = useStore();
  const preview = items.slice(0, 8);
  const loop = [...preview, ...preview];

  return <div className="home-menu-rail" aria-label="Featured menu dishes">
    <motion.div className="home-menu-track" animate={{ x: ['0%', '-50%'] }} transition={{ duration: Math.max(34, preview.length * 7.25), ease: 'linear', repeat: Infinity }}>
      {loop.map((item, index) => <article className="rail-dish" key={`${item._id}-${index}`}>
        <div className="rail-dish-image"><img src={item.image} alt={item.name} loading="lazy" />{item.featured && <span>Signature</span>}<button aria-label={`Favorite ${item.name}`} className={favorites.includes(item._id) ? 'fav active' : 'fav'} onClick={() => toggleFavorite(item._id)}><Heart size={15} fill="currentColor" /></button></div>
        <div className="rail-dish-copy"><div><small>{item.category}</small><h3>{item.name}</h3></div><strong>{money(item.price)}</strong><button onClick={() => onSelect(item)}>Customise <Plus /></button></div>
      </article>)}
    </motion.div>
  </div>;
}
