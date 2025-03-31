import * as React from "react";
import Calendar from "react-calendar";
import { Link, useNavigate } from "react-router-dom";

/**
 * Tela principal do sistema
 *
 * Essa tela é responsável por renderizar o layout principal do sistema, contendo:
 * - Um cabeçalho com um campo de pesquisa
 * - Um painel lateral para navegação
 * - Um painel central com uma tabela de dados e um calendário
 *
 * @returns JSX.Element
 */
export default function TelaPrincipal() {
  return (
    <div className="drawer h-screen">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content relative">
        {/* Conteúdo da página */}
        <div className="w-screen h-[10%] flex items-center p-2">
          <div className="w-[95%] h-full flex items-center justify-center">
            <input
              type="text"
              placeholder="Pesquisar"
              className="input input-bordered w-full max-w-xs"
            />
          </div>
        </div>

        <div className="w-screen h-[90%] flex items-center justify-center p-2">
          <div className="w-1/3 h-full">
            <div className="w-full h-1/2 overflow-x-auto">
              <table className="table">
                {/* Cabeçalho da tabela */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Job</th>
                    <th>Favorite Color</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>1</th>
                    <td>Cy Ganderton</td>
                    <td>Quality Control Specialist</td>
                    <td>Blue</td>
                  </tr>
                  <tr>
                    <th>2</th>
                    <td>Hart Hagerty</td>
                    <td>Desktop Support Technician</td>
                    <td>Purple</td>
                  </tr>
                  <tr>
                    <th>3</th>
                    <td>Brice Swyre</td>
                    <td>Tax Accountant</td>
                    <td>Red</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full h-1/2 flex">
              <Calendar />
            </div>
          </div>
          <div className="w-2/3 h-full flex items-center justify-center">
            GUIA DA DIREITA
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
            <Link to="/Telaatendimento">Atendimento</Link>
          </li>
          <li>
            <Link to="/">Sair</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
