import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarDays, Minus, Plus, ShoppingBag, Sparkles, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api, money } from '../api';
import { useStore } from '../store';

const serviceTypes = [
  { id: 'pickup', label: 'Pickup' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'dine-in', label: 'Dine-in' },
];

export default function CheckoutCart() {
  const { cart, cartOpen, setCartOpen, remove, setQty, clear } = useStore();
  const [step, setStep] = useState(1);
  const [type, setType] = useState('pickup');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', address: '', table: '', scheduledFor: '', guests: 2, notes: '' });
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const total = (subtotal - discount) * 1.1 + (type === 'delivery' ? 450 : 0);

  const update = (field: string, value: string | number) => setForm(current => ({ ...current, [field]: value }));
  async function checkTables() {
    if (!form.scheduledFor) return setMessage('Choose a dining date and time first.');
    setChecking(true); setMessage('');
    try {
      const result = await api<{ available: string[] }>(`/tables/availability?date=${encodeURIComponent(form.scheduledFor)}&guests=${form.guests}`);
      setAvailableTables(result.available);
      if (!result.available.length) setMessage('No suitable tables are available at that time. Please try another time.');
    } catch (error: any) { setMessage(error.message); }
    finally { setChecking(false); }
  }
  async function placeOrder() {
    if (!form.customerName || !form.phone) return setMessage('Your name and phone number are required.');
    if (!form.scheduledFor) return setMessage('Please choose the requested date and time.');
    if (type === 'delivery' && !form.address) return setMessage('Please enter the delivery address.');
    if (type === 'dine-in' && !form.table) return setMessage('Please check availability and choose a table.');
    try {
      const order = await api<any>('/orders', { method: 'POST', body: JSON.stringify({ ...form, type, promoCode: promo, items: cart, source: 'web' }) });
      setMessage(`Order ${order.orderNumber} is confirmed. We'll take beautiful care of it.`);
      clear(); setStep(3);
    } catch (error: any) { setMessage(error.message); }
  }

  return <AnimatePresence>{cartOpen && <>
    <motion.div className="cart-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCartOpen(false)} />
    <motion.aside className="cart checkout-cart" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween' }}>
      <div className="cart-head"><div><span className="eyebrow gold">YOUR SELECTION</span><h2>{step === 1 ? 'The order.' : step === 2 ? 'The details.' : 'Thank you.'}</h2></div><button className="close" onClick={() => setCartOpen(false)}><X /></button></div>
      {step === 1 && <div className="cart-content"><EditableItems cart={cart} remove={remove} setQty={setQty} /></div>}
      {step === 2 && <div className="checkout">
        <button className="checkout-back" onClick={() => setStep(1)}><ArrowLeft /> Edit your items</button>
        <div className="checkout-summary">{cart.map(item => <div key={item.key}><span>{item.quantity}× {item.name}</span><b>{money(item.price * item.quantity)}</b></div>)}</div>
        <label className="field-label">How would you like your order?</label>
        <div className="choice-row service-choice">{serviceTypes.map(option => <button type="button" className={type === option.id ? 'active' : ''} onClick={() => { setType(option.id); setAvailableTables([]); update('table', ''); }} key={option.id}>{option.label}</button>)}</div>
        <div className="checkout-grid"><label><span>Name *</span><input value={form.customerName} onChange={e => update('customerName', e.target.value)} placeholder="Your name" /></label><label><span>Phone *</span><input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+94" /></label></div>
        <label><span>Email</span><input value={form.email} onChange={e => update('email', e.target.value)} placeholder="For your receipt (optional)" /></label>
        <div className="checkout-grid"><label><span><CalendarDays /> {type === 'dine-in' ? 'Dining date & time *' : 'Requested time *'}</span><input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={form.scheduledFor} onChange={e => { update('scheduledFor', e.target.value); setAvailableTables([]); }} /></label><label><span><Users /> Guests</span><select value={form.guests} onChange={e => update('guests', +e.target.value)}>{[1,2,3,4,5,6,7,8,9,10,12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}</select></label></div>
        {type === 'delivery' && <label><span>Delivery address *</span><textarea value={form.address} onChange={e => update('address', e.target.value)} placeholder="Street, city, landmarks and delivery instructions" /></label>}
        {type === 'dine-in' && <div className="table-picker"><button className="availability-button" type="button" onClick={checkTables} disabled={checking}>{checking ? 'Checking...' : 'Check table availability'}</button>{availableTables.length > 0 && <><small>Available for your party:</small><div>{availableTables.map(table => <button type="button" className={form.table === table ? 'active' : ''} onClick={() => update('table', table)} key={table}>Table {table}</button>)}</div></>}</div>}
        <label><span>Order notes</span><textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Allergies, occasion, seating preferences or instructions" /></label>
        <div className="promo"><input placeholder="Promotion code" value={promo} onChange={e => setPromo(e.target.value.toUpperCase())} /><button type="button" onClick={async () => { try { const result = await api<any>('/promotions/validate', { method: 'POST', body: JSON.stringify({ code: promo, subtotal }) }); setDiscount(result.discount); setMessage('Promotion applied.'); } catch (error: any) { setMessage(error.message); } }}>Apply</button></div>
        {message && <p className="notice">{message}</p>}
      </div>}
      {step === 3 && <div className="success"><Sparkles /><h3>A delicious journey has begun.</h3><p>{message}</p><button className="button" onClick={() => setCartOpen(false)}>Continue exploring</button></div>}
      {step < 3 && cart.length > 0 && <div className="cart-foot"><div className="totals"><span>Subtotal <b>{money(subtotal)}</b></span>{discount > 0 && <span>Offer <b>- {money(discount)}</b></span>}<span className="grand">Estimated total <b>{money(total)}</b></span><small>Includes 10% service charge{type === 'delivery' ? ' and delivery' : ''}</small></div><button className="button full" onClick={() => step === 1 ? setStep(2) : placeOrder()}>{step === 1 ? 'Continue to details' : 'Place order'} <ArrowRight /></button></div>}
    </motion.aside>
  </>}</AnimatePresence>;
}

function EditableItems({ cart, remove, setQty }: { cart: ReturnType<typeof useStore>['cart']; remove: (key: string) => void; setQty: (key: string, n: number) => void }) {
  if (!cart.length) return <div className="empty"><ShoppingBag /><h3>Your table is still empty.</h3><p>Explore the menu and select something memorable.</p></div>;
  return <>{cart.map(item => <div className="cart-line" key={item.key}><img src={item.image} alt="" /><div><h4>{item.name}</h4><small>{[item.variant, ...item.addOns.map(addOn => addOn.name), item.spiceLevel].filter(Boolean).join(' · ')}</small>{item.notes && <em>{item.notes}</em>}<div className="qty"><button onClick={() => setQty(item.key, item.quantity - 1)}><Minus /></button>{item.quantity}<button onClick={() => setQty(item.key, item.quantity + 1)}><Plus /></button></div></div><div><strong>{money(item.price * item.quantity)}</strong><button className="remove" onClick={() => remove(item.key)}>Remove</button></div></div>)}</>;
}
