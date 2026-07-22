const API='/api';
export const money=(n:number)=>new Intl.NumberFormat('en-LK',{style:'currency',currency:'LKR',maximumFractionDigits:0}).format(n);
export const api=async<T>(path:string,options:RequestInit={}):Promise<T>=>{const token=localStorage.getItem('veloura_token');const res=await fetch(API+path,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{ }),...options.headers}});const body=await res.json().catch(()=>({}));if(!res.ok)throw new Error(body.message||'Something went wrong');return body};

