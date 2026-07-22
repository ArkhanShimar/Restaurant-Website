import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ChefHat, Clock, Instagram, Mail, MapPin, Phone, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, money } from '../api';
import { useStore } from '../store';
import type { MenuItem } from '../types';
import CheckoutCart from '../components/CheckoutCart';

function PublicNav() {
  const { cart, setCartOpen } = useStore();
  return <nav className="nav public-nav"><Link className="brand" to="/">VELOURA<span>COLOMBO</span></Link><div className="navlinks"><Link to="/about">Our story</Link><Link to="/menu">Full menu</Link><Link to="/contact">Contact</Link><Link to="/#reserve">Reserve</Link></div><button className="icon-btn" onClick={() => setCartOpen(true)}><ShoppingBag />{cart.length > 0 && <i>{cart.reduce((sum, item) => sum + item.quantity, 0)}</i>}</button></nav>;
}

function PageHero({ eyebrow, title, image }: { eyebrow: string; title: React.ReactNode; image: string }) {
  return <header className="page-hero" style={{ backgroundImage: `url(${image})` }}><div className="page-hero-shade"/><div className="page-hero-frame"/><motion.div className="page-hero-copy" initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} transition={{duration:.9}}><div className="page-hero-kicker"><span className="eyebrow">{eyebrow}</span><i/></div><h1>{title}</h1><div className="page-hero-meta"><span>VELOURA / COLOMBO</span><span>SCROLL TO EXPLORE ↓</span></div></motion.div><div className="page-hero-mark">V</div></header>;
}

export function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const { add, setCartOpen } = useStore();
  useEffect(() => { api<MenuItem[]>('/menu').then(setItems); }, []);
  const categories = ['All', ...new Set(items.map(item => item.category))];
  const filtered = useMemo(() => items.filter(item => (category === 'All' || item.category === category) && `${item.name} ${item.description} ${item.dietary.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [items, category, query]);
  const pageSize = 6, pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => setPage(1), [category, query]);
  return <main className="public-page"><PublicNav /><PageHero eyebrow="THE COMPLETE COLLECTION" title={<>The full <em>menu.</em></>} image="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80" /><section className="full-menu section"><div className="menu-toolbar"><div className="filters">{categories.map(value => <button className={category === value ? 'active' : ''} onClick={() => setCategory(value)} key={value}>{value}</button>)}</div><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search dishes or dietary needs" /></div><div className="full-menu-grid">{shown.map((item, index) => <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} key={item._id}><img src={item.image} alt={item.name} loading="lazy" decoding="async" /><div><small>{item.category} {item.dietary.length ? `· ${item.dietary.join(' · ')}` : ''}</small><h2>{item.name}</h2><p>{item.description}</p><footer><strong>{money(item.price)}</strong><button onClick={() => { add({ key: crypto.randomUUID(), menuItem: item._id, name: item.name, price: item.price, quantity: 1, image: item.image, variant: item.variants[0]?.name, addOns: [] }); setCartOpen(true); }}>Add <Plus /></button></footer></div></motion.article>)}</div>{!shown.length && <div className="menu-empty">No dishes match this search.</div>}<div className="pagination"><button disabled={page === 1} onClick={() => setPage(value => value - 1)}><ArrowLeft /></button>{Array.from({ length: pages }, (_, index) => index + 1).map(value => <button className={page === value ? 'active' : ''} onClick={() => setPage(value)}>{String(value).padStart(2, '0')}</button>)}<button disabled={page === pages} onClick={() => setPage(value => value + 1)}><ArrowRight /></button></div></section><CheckoutCart /></main>;
}

export function AboutPage() {
  return <main className="public-page"><PublicNav /><PageHero eyebrow="OUR STORY" title={<>Created with<br/><em>quiet intention.</em></>} image="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80" /><section className="origin-story section"><div className="origin-copy"><span className="eyebrow gold">THE BEGINNING</span><h2>Born from<br/><em>this island.</em></h2><p className="origin-lead">Veloura began with a conviction: Sri Lanka's extraordinary ingredients deserve a dining room where detail, restraint and warmth coexist.</p><p>Our menus travel from coast to highland, following growers, fishers and the rhythm of each season.</p></div><div className="origin-visual"><img src="https://images.unsplash.com/photo-1577106263724-2c8e03bfe9cf?auto=format&fit=crop&w=1000&q=78" alt="Chef composing a dish" loading="lazy" decoding="async"/><span>INGREDIENT / FIRE / MEMORY</span></div><div className="origin-notes"><article><b>01</b><h3>Rooted here</h3><p>Sri Lankan produce, coastal catch and close local partnerships.</p></article><article><b>02</b><h3>Led by season</h3><p>An evolving menu rather than a fixed collection of signatures.</p></article><article><b>03</b><h3>Made for now</h3><p>Global technique expressed through a distinctly local point of view.</p></article></div></section><section className="about-image"><div className="about-image-shade"/><div className="about-image-content"><span className="eyebrow">AT THE PASS</span><blockquote>“We do not decorate ingredients. We listen to them.”</blockquote><div><span><b>14</b> Local growers</span><span><b>03</b> Coastal partners</span><span><b>01</b> Evolving menu</span></div><small>THE VELOURA KITCHEN PHILOSOPHY</small></div></section><section className="values section"><article><b>01</b><h3>Ingredient first</h3><p>We buy at the peak of the season and let each ingredient keep its voice.</p></article><article><b>02</b><h3>Human service</h3><p>Luxury is thoughtful attention—warm, intuitive and never rehearsed.</p></article><article><b>03</b><h3>Responsible craft</h3><p>Local sourcing, low-waste prep and considered partnerships shape every service.</p></article></section><Link className="story-cta" to="/menu">Explore the complete menu <ArrowRight /></Link></main>;
}

export function ContactPage() {
  const [sent, setSent] = useState(false);
  return <main className="public-page"><PublicNav /><PageHero eyebrow="CONTACT & PRIVATE DINING" title={<>Let's create<br/><em>your evening.</em></>} image="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1600&q=80" /><section className="contact-layout section"><div><span className="eyebrow gold">VISIT VELOURA</span><h2>We would love to hear from you.</h2><p><MapPin />42 Galle Face Terrace, Colombo 03</p><p><Phone />+94 11 234 5678</p><p><Mail />reservations@veloura.lk</p><p><Clock />Daily, 12:00 - 23:30</p><a href="https://instagram.com"><Instagram /> Follow our story</a></div><form onSubmit={event => { event.preventDefault(); setSent(true); }}><label>Name<input required /></label><label>Email<input required type="email" /></label><label>Phone<input /></label><label>Enquiry type<select><option>General enquiry</option><option>Private dining</option><option>Celebration</option><option>Press and partnerships</option></select></label><label>Message<textarea required rows={5} /></label><button className="button full">Send enquiry <ArrowRight /></button>{sent && <p className="notice">Thank you. Our reservations team will be in touch shortly.</p>}</form></section></main>;
}
