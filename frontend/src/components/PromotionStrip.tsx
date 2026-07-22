import { useEffect, useState } from 'react';
import { ArrowRight, Gift, X } from 'lucide-react';
import { api, money } from '../api';

type Promotion = { _id: string; code: string; title: string; description: string; type: 'percentage' | 'fixed'; value: number; minOrder: number };

export default function PromotionStrip() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [hidden, setHidden] = useState(false);
  useEffect(() => { api<Promotion[]>('/promotions').then(setPromotions).catch(() => {}); }, []);
  if (hidden || !promotions.length) return null;
  const promo = promotions[0];
  return <aside className="promotion-strip"><Gift /><div><small>LIMITED OFFER</small><strong>{promo.title}</strong><span>{promo.description} Use <b>{promo.code}</b>{promo.minOrder ? ` on orders over ${money(promo.minOrder)}` : ''}.</span></div><a href="/menu">Order now <ArrowRight /></a><button aria-label="Dismiss offer" onClick={() => setHidden(true)}><X /></button></aside>;
}
