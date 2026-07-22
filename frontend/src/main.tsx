import React from'react';import{createRoot}from'react-dom/client';import{BrowserRouter,Routes,Route}from'react-router-dom';import{StoreProvider}from'./store';import Home from'./pages/Home';import Admin from'./pages/Admin';import'./styles.css';import'./admin.css';import'./ops.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><StoreProvider><Routes><Route path="/" element={<Home/>}/><Route path="/admin/*" element={<Admin/>}/></Routes></StoreProvider></BrowserRouter></React.StrictMode>);


