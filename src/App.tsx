import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Guiche from "./pages/Guiche";
import Telaatendimento from "./pages/Profile/medic/telaatendimento";

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota para a página de login */}
        <Route path="/" element={<Login />} />
        {/* Rota para a página de guichê */}
        <Route path="/Guiche" element={<Guiche />} />
        {/* Rota dinâmica para perfis */}
        <Route path="/:profileType/*" element={<Profile />} />
        <Route path="/Telaatendimento" element={<Telaatendimento />} />
      </Routes>
    </Router>
  );
}

export default App;