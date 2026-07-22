import { Heart, Plus } from 'lucide-react';
import { money } from '../api';
import { useStore } from '../store';
import type { MenuItem } from '../types';

export default function HomeMenuRail({ items, onSelect }: { items: MenuItem[]; onSelect: (item: MenuItem) => void }) {
  const { favorites, toggleFavorite } = useStore();
  const preview = items.slice(0, 8);
  const copies = preview.length ? Math.max(1, Math.ceil(8 / preview.length)) : 1;
  const group = Array.from({ length: copies }, () => preview).flat();

  const renderGroup = (duplicate: boolean) => <div className="home-menu-group" aria-hidden={duplicate || undefined}>
    {group.map((item, index) => <article className="rail-dish" key={`${duplicate ? 'copy' : 'original'}-${item._id}-${index}`}>
      <div className="rail-dish-image"><img src={item.image} alt={duplicate ? '' : item.name} loading={index < 4 && !duplicate ? 'eager' : 'lazy'} decoding="async" />{item.featured && <span>Signature</span>}<button aria-label={`Favorite ${item.name}`} tabIndex={duplicate ? -1 : undefined} className={favorites.includes(item._id) ? 'fav active' : 'fav'} onClick={() => toggleFavorite(item._id)}><Heart size={15} fill="currentColor" /></button></div>
      <div className="rail-dish-copy"><div><small>{item.category}</small><h3>{item.name}</h3></div><strong>{money(item.price)}</strong><button tabIndex={duplicate ? -1 : undefined} onClick={() => onSelect(item)}>Customise <Plus /></button></div>
    </article>)}
  </div>;

  return <div className="home-menu-rail" aria-label="Featured menu dishes"><div className="home-menu-track">{renderGroup(false)}{renderGroup(true)}</div></div>;
}