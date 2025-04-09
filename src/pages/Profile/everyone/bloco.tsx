import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// Interface para uma nota
interface Note {
  id: number;
  title: string;
  content: string;
}

function Notes() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userProfile, setUserProfile] = useState<string | null>(null);

  // Estado para as notas, carregadas do localStorage
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem("notes");
    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  // Estado para a nota selecionada
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Estado para os campos de edição
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const logoSrc = "LOVE KIDS.png";
  const goback = "go-back-svgrepo-com.png";

  // Função para verificar se o usuário está online e obter o perfil
  const checkUserStatus = async () => {
    const nome = localStorage.getItem("nome");
    if (!nome) {
      console.log("Nome não encontrado no localStorage. Redirecionando para login.");
      setIsAuthorized(false);
      return;
    }

    // Verifica se o usuário já foi autorizado anteriormente para esta página
    const authorizationKey = `authorized_${window.location.pathname}`;
    const isPreviouslyAuthorized = localStorage.getItem(authorizationKey) === "true";
    if (isPreviouslyAuthorized) {
      console.log("Página já autorizada anteriormente.");
      try {
        // Ainda precisamos buscar o perfil para o redirecionamento
        const userResponse = await axios.get(
          `http://localhost:8080/usuarios/getProfileByUserName/${nome}`
        );
        console.log("Resposta do getProfileByUserName:", userResponse.data);

        if (!userResponse.data || !userResponse.data.perfil) {
          console.log("Perfil não encontrado para o usuário.");
          setIsAuthorized(false);
          localStorage.removeItem(authorizationKey);
          return;
        }

        const perfil = userResponse.data.perfil;
        setUserProfile(perfil);
        setIsAuthorized(true);
      } catch (err) {
        console.error("Erro ao buscar perfil do usuário:", err);
        setIsAuthorized(false);
        localStorage.removeItem(authorizationKey);
      }
      return;
    }

    try {
      console.log("Buscando perfil do usuário:", nome);
      const userResponse = await axios.get(
        `http://localhost:8080/usuarios/getProfileByUserName/${nome}`
      );
      console.log("Resposta do getProfileByUserName:", userResponse.data);

      if (!userResponse.data || !userResponse.data.perfil) {
        console.log("Perfil não encontrado para o usuário.");
        setIsAuthorized(false);
        return;
      }

      const perfil = userResponse.data.perfil;
      setUserProfile(perfil);

      // Verifica se o usuário está online
      const usuarioResponse = await axios.get(
        `http://localhost:8080/usuarios/getProfileByUserName/${nome}`
      );
      const isOnline = usuarioResponse.data.online;

      if (isOnline) {
        console.log("Usuário está online. Definindo como offline...");
        await axios.post("http://localhost:8080/usuarios/setUserOffline", null, {
          params: { nome },
        });
        setIsAuthorized(true);
        // Salva a autorização no localStorage
        localStorage.setItem(authorizationKey, "true");
      } else {
        console.log("Usuário não está online. Redirecionando para login.");
        setIsAuthorized(false);
        localStorage.removeItem(authorizationKey);
      }
    } catch (err) {
      console.error("Erro ao verificar status do usuário:", err);
      setIsAuthorized(false);
      localStorage.removeItem(authorizationKey);
    }
  };

  // Função para navegar de volta à página principal do perfil
  const navigateToProfilePage = async () => {
    const nome = localStorage.getItem("nome");
    if (nome) {
      try {
        await axios.post("http://localhost:8080/usuarios/setUserOnline", null, {
          params: { nome },
        });
        // Remove a autorização ao sair da página
        const authorizationKey = `authorized_${window.location.pathname}`;
        localStorage.removeItem(authorizationKey);
        navigate(`/${userProfile}`);
      } catch (err) {
        console.error("Erro ao definir usuário como online:", err);
        navigate(`/${userProfile}`);
      }
    } else {
      navigate(`/${userProfile}`);
    }
  };

  // Salva as notas no localStorage sempre que o estado mudar
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
    // Se não houver notas, limpa a nota selecionada
    if (notes.length === 0) {
      setSelectedNote(null);
      setEditTitle("");
      setEditContent("");
    }
  }, [notes]);

  // Atualiza os campos de edição quando uma nota é selecionada
  useEffect(() => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    } else {
      setEditTitle("");
      setEditContent("");
    }
  }, [selectedNote]);

  // Verifica o status do usuário ao carregar a página
  useEffect(() => {
    checkUserStatus();
  }, []);

  // Redireciona para a página de login se não estiver autorizado
  useEffect(() => {
    if (isAuthorized === false) {
      navigate("/");
    }
  }, [isAuthorized, navigate]);

  // Função para adicionar uma nova nota
  const addNote = () => {
    const newNote: Note = {
      id: notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1,
      title: "Nova Nota",
      content: "",
    };
    setNotes([...notes, newNote]);
    setSelectedNote(newNote);
  };

  // Função para atualizar a nota selecionada
  const updateNote = () => {
    if (!selectedNote) return;
    setNotes(
      notes.map((note) =>
        note.id === selectedNote.id
          ? { ...note, title: editTitle, content: editContent }
          : note
      )
    );
    setSelectedNote({
      ...selectedNote,
      title: editTitle,
      content: editContent,
    });
  };

  // Função para excluir a nota selecionada
  const deleteNote = () => {
    if (!selectedNote) return;
    setNotes(notes.filter((note) => note.id !== selectedNote.id));
    setSelectedNote(null);
  };

  if (isAuthorized === null) {
    return <div>Carregando...</div>;
  }

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
              to={`/${userProfile}`}
              className="tooltip"
              data-tip="Voltar"
              onClick={(e) => {
                e.preventDefault();
                navigateToProfilePage();
              }}
            >
              <img
                src={goback}
                alt="Voltar à Página Principal"
                className="h-10 w-10"
              />
            </Link>
          </li>
        </ul>
        <br />
        <div className="text-center text-lg text-red-500 font-bold">
          Atenção: Todas as notas criadas aqui só ficarão salvas até o cachê do
          navegador ser limpo, <br /> não salve notas muito importantes ou documentos
          aqui.
        </div>
      </div>

      {/* Colunas */}
      <div className="mt-2 flex flex-1 gap-4">
        {/* Lista de notas (esquerda) */}
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Notas</h2>
            <button className="btn btn-primary btn-sm" onClick={addNote}>
              + Nova Nota
            </button>
          </div>
          {notes.length > 0 ? (
            <ul className="space-y-2">
              {notes.map((note) => (
                <li
                  key={note.id}
                  className={`p-2 rounded cursor-pointer ${
                    selectedNote?.id === note.id ? "bg-blue-200" : "bg-gray-200"
                  }`}
                  onClick={() => setSelectedNote(note)}
                >
                  {note.title || "Sem Título"}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhuma nota disponível. Crie uma nova nota!</p>
          )}
        </div>

        {/* Detalhes da nota (direita) */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
          {selectedNote ? (
            <>
              <h2 className="text-xl font-bold mb-4">Editar Nota</h2>
              <div className="space-y-4">
                {/* Campo de título */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Título</span>
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={updateNote} // Salva ao perder o foco
                    className="input input-bordered w-full"
                    placeholder="Digite o título da nota"
                  />
                </div>

                {/* Campo de conteúdo */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Conteúdo</span>
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onBlur={updateNote} // Salva ao perder o foco
                    className="textarea textarea-bordered h-64 w-full"
                    placeholder="Digite o conteúdo da nota"
                  />
                </div>

                {/* Botão de excluir */}
                <div className="flex justify-end">
                  <button className="btn btn-danger" onClick={deleteNote}>
                    Excluir Nota
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center">
              Selecione uma nota para editar ou crie uma nova nota.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;