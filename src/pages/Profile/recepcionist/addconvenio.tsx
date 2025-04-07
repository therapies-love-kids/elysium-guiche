import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

function Addconvenio() {
  const { perfil, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const logoSrc = "LOVE KIDS.png";
  const addmedic = "add-medic.png";
  const addpatient = "add-patient.png";
  const bloco = "memo-pencil-svgrepo-com.svg";
  const addagendamento = "add-agendamento.png";

  // Determina o perfil da página com base no nome da pasta
  const pageProfile = "recepcionist"; // Nome da pasta onde a página está localizada

  // Função para verificar se o usuário tem acesso à página
  const checkAccess = async () => {
    const nome = localStorage.getItem("nome");
    if (!nome && !perfil) {
      setIsAuthorized(false);
      return;
    }

    // Verifica se a página já foi autorizada anteriormente (para evitar redirecionamento ao recarregar)
    const authorizationKey = `authorized_${window.location.pathname}`;
    const isPreviouslyAuthorized =
      localStorage.getItem(authorizationKey) === "true";
    if (isPreviouslyAuthorized) {
      setIsAuthorized(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/usuarios/checkAccess",
        null,
        {
          params: { nome, pageProfile },
        }
      );
      const hasAccess = response.data.hasAccess;
      setIsAuthorized(hasAccess);

      if (hasAccess) {
        // Armazena a autorização no localStorage para permitir recarregamento
        localStorage.setItem(authorizationKey, "true");
      } else {
        localStorage.removeItem(authorizationKey);
      }
    } catch (err) {
      console.error("Erro ao verificar acesso:", err);
      setIsAuthorized(false);
      localStorage.removeItem(authorizationKey);
    }
  };

  // Função para definir o usuário como online antes de navegar para outra página
  const setUserOnlineAndNavigate = async (path: string) => {
    const nome = localStorage.getItem("nome");
    if (nome) {
      try {
        await axios.post("http://localhost:8080/usuarios/setUserOnline", null, {
          params: { nome },
        });
        navigate(path);
      } catch (err) {
        console.error("Erro ao definir usuário como online:", err);
        navigate(path); // Navega mesmo se houver erro, mas isso pode ser ajustado conforme necessário
      }
    } else {
      navigate(path);
    }
  };

  // Verifica o acesso ao carregar a página
  useEffect(() => {
    checkAccess();
  }, []);

  // Redireciona para a página de login se não estiver autorizado
  useEffect(() => {
    if (isAuthorized === false) {
      logout();
      navigate("/");
    }
  }, [isAuthorized, navigate, logout]);

  // Mostra um carregando enquanto verifica o acesso
  if (isAuthorized === null) {
    return <div>Carregando...</div>;
  }

  // Não renderiza nada se não estiver autorizado (o useEffect lidará com o redirecionamento)
  if (!isAuthorized) {
    return null;
  }

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
            <Link
              to="/"
              className="tooltip"
              data-tip="Sair"
              onClick={(e) => {
                e.preventDefault();
                logout();
                navigate("/");
              }}
            >
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
              to="/addmedic"
              className="tooltip"
              data-tip="Adicionar médico"
              onClick={(e) => {
                e.preventDefault();
                setUserOnlineAndNavigate("/addmedic");
              }}
            >
              <img src={addmedic} alt="Logo" className="h-10 w-10" />
            </Link>
          </li>
          <li>
            <Link
              to="/addpatient"
              className="tooltip"
              data-tip="Adicionar paciente"
              onClick={(e) => {
                e.preventDefault();
                setUserOnlineAndNavigate("/addpatient");
              }}
            >
              <img src={addpatient} alt="Logo" className="h-10 w-10" />
            </Link>
          </li>
          <li>
            <Link
              to="/recepcionist"
              className="tooltip"
              data-tip="Adicionar Agendamento"
              onClick={(e) => {
                e.preventDefault();
                setUserOnlineAndNavigate("/recepcionist");
              }}
            >
              <img src={addagendamento} alt="Logo" className="h-10 w-10" />
            </Link>
          </li>
          <li>
            <Link
              to="/bloco"
              className="tooltip"
              data-tip="Bloco de anotações"
              onClick={(e) => {
                e.preventDefault();
                setUserOnlineAndNavigate("/bloco");
              }}
            >
              <img src={bloco} alt="Logo" className="h-10 w-10" />
            </Link>
          </li>
        </ul>
        <br />
      </div>
      {/* Colunas */}
      <div className="mt-2 flex flex-1 gap-4">
        {/* Lista de notas (esquerda) */}
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md"></div>

        {/* Detalhes da nota (direita) */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md"></div>
      </div>
    </div>
  );
}

export default Addconvenio;
