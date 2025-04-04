import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Interface para uma nota
interface Note {
  id: number;
  title: string;
  content: string;
}

function Recepcionist() {
  
  const logoSrc = "LOVE KIDS.png";
  const telaatendimento = "clipboard-text-alt-svgrepo-com.svg";

  return (
    <div className="h-screen w-screen flex flex-col p-4 bg-blue-100">
      {/* Logo no canto superior direito */}
      <div className="absolute top-0 right-0 p-4">
        <img src={logoSrc} alt="Logo" className="h-32 w-46" />
      </div>

      {/* Menu Horizontal */}
      <div className="mt-4 flex flex-col gap-4">
        <ul className="menu menu-horizontal bg-base-200 rounded-box">
          <li>
            <Link to="/" className="tooltip" data-tip="Sair">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </Link>
          </li>
          <li>
            <Link
              to="/bloco"
              className="tooltip"
              data-tip="Tela de Atendimento"
            >
              <img
                src={telaatendimento}
                alt="Tela de Atendimento"
                className="h-10 w-10"
              />
            </Link>
          </li>
        </ul>
        <br />
      </div>
      {/* Colunas */}
      <div className="mt-2 flex flex-1 gap-4">
        {/* Lista de notas (esquerda) */}
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
        </div>

        {/* Detalhes da nota (direita) */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
         </div>
      </div>
    </div>
  );
}

export default Recepcionist;
