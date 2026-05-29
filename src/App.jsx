import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Vitrine from './pages/Vitrine';
import DetalhesJogo from './pages/DetalhesJogo';
import Login from './pages/Login';
import Biblioteca from './pages/Biblioteca';
import Estudio from './pages/Estudio';
import RotaProtegida from './components/RotaProtegida';

import './App.css'

function App() {
  return (
    <Router>
      <div className="bg-gradient-to-b from-[#1b2838] to-[#171a21] text-[#c7d5e0] min-h-screen flex flex-col justify-between selection:bg-[#66c0f4] selection:text-black">
        <Navbar/>

        <main className="flex-grow flex items-center justify-center py-10">
          <Routes>
            <Route path='/' element={<Vitrine/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path="/jogo/:id" element={<DetalhesJogo />} />
            <Route path="/biblioteca" element={<RotaProtegida><Biblioteca /></RotaProtegida>} />
            <Route path="/estudio" element={<RotaProtegida><Estudio /></RotaProtegida>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
