import React from'react';import{createRoot}from'react-dom/client';import{BrowserRouter,Routes,Route}from'react-router-dom';import{StoreProvider}from'./store';import Home from'./pages/Home';import{MenuPage,AboutPage,ContactPage}from'./pages/PublicPages';import Admin from'./pages/Admin';import'./styles.css';import'./admin.css';import'./ops.css';import'./enhancements.css';import'./hero-polish.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><StoreProvider><Routes><Route path="/" element={<Home/>}/><Route path="/menu" element={<MenuPage/>}/><Route path="/about" element={<AboutPage/>}/><Route path="/contact" element={<ContactPage/>}/><Route path="/admin/*" element={<Admin/>}/></Routes></StoreProvider></BrowserRouter></React.StrictMode>);


