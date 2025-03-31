import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../App";
import Telaprincipal from "./telaprincipal";
import Guiche from "./Guiche";
import Telaatendimento from "./Profile/medic/telaatendimento";
export default function Root() {
  const App: React.FC = () => {
    return (
      <App />
    )
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Telaprincipal" element={<Telaprincipal />} />
        <Route path="/Telaatendimento" element={<Telaatendimento />} />
        <Route path="/Guiche" element={<Guiche />} />
      </Routes>
    </Router>
  );
}
