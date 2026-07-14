import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ChatBox from './components/ChatBox';
import Home from './pages/Home';
import Apresentacao from './pages/Apresentacao';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background relative selection:bg-primary/30">
        <Header />

        {/* Main Routing */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apresentacao" element={<Apresentacao />} />
          <Route path="/modulos" element={<div className="pt-32 text-center text-xl text-stone-600">Em desenvolvimento...</div>} />
          <Route path="/biblioteca" element={<div className="pt-32 text-center text-xl text-stone-600">Em desenvolvimento...</div>} />
          <Route path="/glossario" element={<div className="pt-32 text-center text-xl text-stone-600">Em desenvolvimento...</div>} />
        </Routes>

        {/* Floating Chat Box */}
        <ChatBox />
      </div>
    </Router>
  );
};

export default App;
