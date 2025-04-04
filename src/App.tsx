import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Guiche from "./pages/Guiche";
import Telaatendimento from "./pages/Profile/medic";
import Help from "./pages/helpPassword";
import Bloco from "./pages/Profile/everyone/bloco";
import Recepcionist from "./pages/Profile/recepcionist";
import Addconvenio from "./pages/Profile/recepcionist/addconvenio";
import Addmedic from "./pages/Profile/recepcionist/addmedic";
import Addpatient from "./pages/Profile/recepcionist/addpatient";

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
        <Route path="/helpPassword" element={<Help />} />
        <Route path="/bloco" element={<Bloco />} />
        <Route path="/recepcionist" element={<Recepcionist />} />
        <Route path="/addconvenio" element={<Addconvenio />} />
        <Route path="/addmedic" element={<Addmedic />} />
        <Route path="/addpatient" element={<Addpatient />} />
      </Routes>
    </Router>
  );
}

export default App;