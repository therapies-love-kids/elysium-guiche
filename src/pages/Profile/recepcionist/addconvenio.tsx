import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

// Interface para o Convênio, baseada no ConvenioDTO do backend
interface Convenio {
  pk: number;
  ativo: boolean;
  nome: string;
  nomeCurto: string; // Ajustado para corresponder ao ConvenioDTO (nomeCurto)
}

function Addconvenio() {
  const { perfil, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [selectedConvenio, setSelectedConvenio] = useState<Convenio | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ativo: true, nome: "", nomeCurto: "" });
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState({ ativo: true, nome: "", nomeCurto: "" }); // Ajustado para corresponder ao DTO

  const logoSrc = "LOVE KIDS.png";
  const addmedic = "add-medic.png";
  const addpatient = "add-patient.png";
  const bloco = "memo-pencil-svgrepo-com.svg";
  const addagendamento = "add-agendamento.png";

  // Determina o perfil da página com base no nome da pasta
  const pageProfile = "recepcionist";

  // Função para verificar se o usuário tem acesso à página
  const checkAccess = async () => {
    const nome = localStorage.getItem("nome");
    if (!nome && !perfil) {
      setIsAuthorized(false);
      return;
    }

    const authorizationKey = `authorized_${window.location.pathname}`;
    const isPreviouslyAuthorized = localStorage.getItem(authorizationKey) === "true";
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

  // Função para definir o usuário como online antes de navegar
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
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  // Função para buscar todos os convênios
  const fetchConvenios = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/convenios");
      if (response.status === 200) {
        setConvenios(response.data);
      } else {
        setConvenios([]);
      }
    } catch (err) {
      console.error("Erro ao buscar convênios:", err);
      setConvenios([]);
    }
  };

  const deleteModal = async (convenio: Convenio) => {
    try {
      console.log("Deletando convênio:", convenio.pk);
      // Faz a requisição de exclusão e aguarda a resposta
      await axios.delete(`http://localhost:8080/api/convenios/${convenio.pk}`);
      
      // Após a exclusão bem-sucedida, atualiza a lista
      await fetchConvenios();
      
      // Fecha o modal e limpa a seleção
      setIsModalOpen(false);
      setSelectedConvenio(null);
    } catch (err) {
      console.error("Erro ao deletar convênio:", err);
    }
  };

  // Função para adicionar um novo convênio
  const addConvenio = async () => {
    console.log("Adicionando convênio (objeto):", addForm);
    console.log("Adicionando convênio (JSON):", JSON.stringify(addForm));
    try {
      const response = await axios.post(
        "http://localhost:8080/api/convenios",
        addForm,
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        }
      );
      console.log("Resposta do servidor:", response.data);
      if (response.status === 200) { // O backend retorna 200 para POST bem-sucedido
        const newConvenio = response.data;
        setConvenios((prev) => [...prev, newConvenio]);
        setIsAdding(false);
        setAddForm({ ativo: true, nome: "", nomeCurto: "" });
        setSelectedConvenio(newConvenio);
      }
    } catch (err: any) {
      console.error("Erro ao adicionar convênio:", err.response?.data || err.message);
      console.error("Status:", err.response?.status);
      console.error("Headers:", err.response?.headers);
    }
  };

  // Função para abrir o modal de edição com os dados do convênio
  const openEditModal = (convenio: Convenio) => {
    setEditForm({
      ativo: convenio.ativo,
      nome: convenio.nome,
      nomeCurto: convenio.nomeCurto,
    });
    setIsModalOpen(true);
  };

  // Função para atualizar os detalhes do convênio
  const updateConvenioDetails = async (pk: number) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/api/convenios/${pk}`,
        editForm,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.status === 200) {
        // Atualiza a lista de convênios e o convênio selecionado
        setConvenios((prev) =>
          prev.map((convenio) =>
            convenio.pk === pk ? { ...convenio, ...editForm } : convenio
          )
        );
        setSelectedConvenio((prev) =>
          prev && prev.pk === pk ? { ...prev, ...editForm } : prev
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Erro ao atualizar convênio:", err);
    }
  };

  // Verifica o acesso ao carregar a página
  useEffect(() => {
    checkAccess();
  }, []);

  // Busca os convênios quando a página está autorizada
  useEffect(() => {
    if (isAuthorized) {
      fetchConvenios();
    }
  }, [isAuthorized]);

  // Redireciona para login se não estiver autorizado
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

  // Não renderiza nada se não estiver autorizado
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
      </div>

      {/* Colunas */}
      <div className="mt-12 flex flex-1 gap-4">
        {/* Lista de Convênios (esquerda) */}
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Lista de Convênios</h2>
          <button
            className="btn btn-primary mb-4"
            onClick={() => {
              setIsAdding(true);
              setSelectedConvenio(null);
              setAddForm({ ativo: true, nome: "", nomeCurto: "" });
            }}
          >
            Adicionar Convênio
          </button>
          {convenios.length > 0 ? (
            <ul className="space-y-2">
              {convenios.map((convenio) => (
                <li
                  key={convenio.pk}
                  className={`p-2 rounded cursor-pointer ${
                    selectedConvenio?.pk === convenio.pk && !isAdding ? "bg-blue-200" : "bg-gray-200"
                  }`}
                  onClick={() => {
                    setSelectedConvenio(convenio);
                    setIsAdding(false);
                  }}
                >
                  {convenio.nomeCurto} {convenio.ativo ? "(Ativo)" : "(Inativo)"}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum convênio cadastrado.</p>
          )}
        </div>

        {/* Detalhes ou Formulário de Adição (direita) */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
          {isAdding ? (
            <>
              <h2 className="text-xl font-bold mb-4">Adicionar Novo Convênio</h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.nome}
                    onChange={(e) => setAddForm({ ...addForm, nome: e.target.value })}
                    className="input input-bordered"
                    placeholder="Nome do convênio"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Nome Curto</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.nomeCurto}
                    onChange={(e) => setAddForm({ ...addForm, nomeCurto: e.target.value })}
                    className="input input-bordered"
                    placeholder="Nome curto do convênio"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Ativo</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={addForm.ativo}
                    onChange={(e) => setAddForm({ ...addForm, ativo: e.target.checked })}
                    className="toggle"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={addConvenio}
                    disabled={!addForm.nome.trim() || !addForm.nomeCurto.trim()}
                  >
                    Salvar
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </>
          ) : selectedConvenio ? (
            <>
              <h2 className="text-xl font-bold mb-4">Detalhes do Convênio</h2>
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedConvenio.pk}</p>
                <p><strong>Nome:</strong> {selectedConvenio.nome}</p>
                <p><strong>Nome Curto:</strong> {selectedConvenio.nomeCurto}</p>
                <p><strong>Status:</strong> {selectedConvenio.ativo ? "Ativo" : "Inativo"}</p>
              </div>
              <div className="mt-4">
                <button
                  className="btn btn-warning"
                  onClick={() => openEditModal(selectedConvenio)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-error ml-2"
                  onClick={() => deleteModal(selectedConvenio)}
                >
                  Excluir
                </button>
              </div>
            </>
          ) : (
            <p className="text-center">Selecione um convênio ou adicione um novo.</p>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {isModalOpen && selectedConvenio && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Editar Convênio</h3>
            <div className="py-4">
              <div className="form-control my-4">
                <label className="label">
                  <span className="label-text">Nome:</span>
                </label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="input input-bordered ml-12"
                />
              </div>
              <div className="form-control my-4">
                <label className="label">
                  <span className="label-text">Nome Curto:</span>
                </label>
                <input
                  type="text"
                  value={editForm.nomeCurto}
                  onChange={(e) => setEditForm({ ...editForm, nomeCurto: e.target.value })}
                  className="input input-bordered ml-2"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Ativo</span>
                </label>
                <input
                  type="checkbox"
                  checked={editForm.ativo}
                  onChange={(e) => setEditForm({ ...editForm, ativo: e.target.checked })}
                  className="toggle ml-2"
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary ml-2"
                onClick={() => updateConvenioDetails(selectedConvenio.pk)}
              >
                Salvar
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Addconvenio;