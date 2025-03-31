import * as React from "react";
import Calendar from "react-calendar";
import { Link, useNavigate } from "react-router-dom";

export default function TelaPrincipal() {
  return (
    <div className="drawer h-screen">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content relative">
        {/* Conteúdo da página */}
        <div className="w-screen h-screen flex">
          <div className="w-[20%] h-full flex items-center justify-center border-r">
            <p>Lista de pacientes</p>
          </div>
          <div className="w-[80%] h-full">
            <div className="h-[50%] w-full flex items-center justify-center">
              <p>Dados do paciente e botão iniciar atendimento</p>
            </div>
            <div className="h-[50%] w-full flex items-center justify-center">
                <p>campo de observações e botão gerar indicação</p>
            </div>
          </div>
        </div>
        {/* Botão para abrir o drawer */}
        <label
          htmlFor="my-drawer"
          className="btn btn-primary drawer-button absolute top-4 left-4"
        >
          Open drawer
        </label>
      </div>

      <div className="drawer-side">
        <label
          htmlFor="my-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        <li>
            <Link to="/TelaPrincipal">Tela Principal</Link>
          </li>
          <li>
            <Link to="/">Sair</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
