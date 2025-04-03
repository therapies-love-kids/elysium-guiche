import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Interface para uma nota
interface Note {
  id: number;
  title: string;
  content: string;
}

function Recepcionist() {
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
  const telaatendimento = "clipboard-text-alt-svgrepo-com.svg";

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
              to="/telaatendimento"
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
        <div className="text-center text-lg text-red-500 font-bold">
          Atenção Todas as notas criadas aqui só ficarão salvas até o cachê do
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

export default Recepcionist;
