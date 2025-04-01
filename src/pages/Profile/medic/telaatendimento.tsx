import React, { useState, useEffect } from "react";
import axios from "axios";

// Ajustando a interface para corresponder ao AgendamentoDTO retornado pelo backend
interface Agendamento {
  pk: number;
  codigo: string;
  sala: string;
  dataHoraSala: string;
  tipo: string;
  status: string;
  observacoes: string | null;
  especialistaColaboradorId: number | null;
  pacienteId: number | null;
  recepcionistaColaboradorId: number | null;
  responsavelId: number | null;
  unidadePrefixo: string | null;
  dataHoraCriacao: string | null;
}

function Medico() {
  const [waitingAgendamentos, setWaitingAgendamentos] = useState<Agendamento[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]); // Data atual por padrão
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ sala: "", tipo: "", observacoes: "" });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Estado para controlar o drawer

  const colaboradorId = 6; // ID do colaborador (pode ser dinâmico em um cenário real)

  // Busca os agendamentos para a data e colaborador selecionados
  const fetchWaitingAgendamentos = async () => {
    try {
      console.log(`Buscando agendamentos para colaborador ${colaboradorId} na data ${selectedDate}`);
      const response = await axios.get("http://localhost:8080/agendamentos/by-date-and-colaborador", {
        params: {
          colaboradorId,
          data: selectedDate,
        },
        withCredentials: true,
      });
      console.log("Resposta recebida:", response);

      if (response.status === 200) {
        // Filtra apenas os agendamentos com status "em espera"
        const waiting = response.data.filter((agendamento: Agendamento) => agendamento.status === "em espera");
        console.log("Agendamentos em espera encontrados:", waiting);
        setWaitingAgendamentos(waiting);
      } else if (response.status === 204) {
        console.log("Nenhum agendamento encontrado (status 204)");
        setWaitingAgendamentos([]);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setWaitingAgendamentos([]);
    }
  };

  // Atualiza o status do agendamento
  const updateAgendamentoStatus = async (pk: number, newStatus: string) => {
    if (!pk) {
      console.error("ID do agendamento não definido!");
      return;
    }

    try {
      console.log(`Enviando requisição para atualizar status do agendamento ${pk} para: ${newStatus}`);
      const response = await axios.put(
        `http://localhost:8080/agendamentos/${pk}/status`,
        { status: newStatus },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log("Resposta recebida:", response);

      if (response.status === 200) {
        if (newStatus === "finalizado") {
          setWaitingAgendamentos((prev) => prev.filter((agendamento) => agendamento.pk !== pk));
          setSelectedAgendamento(null);
        } else if (newStatus === "em atendimento") {
          setWaitingAgendamentos((prev) =>
            prev.map((agendamento) =>
              agendamento.pk === pk ? { ...agendamento, status: newStatus } : agendamento
            )
          );
          setSelectedAgendamento((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    } catch (err) {
      console.error("Erro ao atualizar status do agendamento:", err);
    }
  };

  // Abre o modal de edição com os valores atuais do agendamento
  const openEditModal = (agendamento: Agendamento) => {
    setEditForm({
      sala: agendamento.sala || "",
      tipo: agendamento.tipo || "",
      observacoes: agendamento.observacoes || "",
    });
    setIsModalOpen(true);
  };

  // Atualiza os detalhes do agendamento
  const updateAgendamentoDetails = async (pk: number) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/agendamentos/${pk}/details`,
        editForm,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        // Atualiza a lista de agendamentos e o agendamento selecionado
        setWaitingAgendamentos((prev) =>
          prev.map((agendamento) =>
            agendamento.pk === pk ? { ...agendamento, ...editForm } : agendamento
          )
        );
        setSelectedAgendamento((prev) =>
          prev && prev.pk === pk ? { ...prev, ...editForm } : prev
        );
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Erro ao atualizar detalhes do agendamento:", err);
    }
  };

  useEffect(() => {
    fetchWaitingAgendamentos();
    const intervalId = setInterval(fetchWaitingAgendamentos, 15000);
    return () => clearInterval(intervalId);
  }, [selectedDate]);

  return (
    <div className="drawer">
      <input
        id="my-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={() => setIsDrawerOpen(!isDrawerOpen)}
      />
      <div className="drawer-content">
        <div className="h-screen w-screen flex flex-col p-4 bg-gray-100">
          {/* Botão "Open drawer" e seletor de data */}
          <div className="mb-4 flex gap-4">
            <label htmlFor="my-drawer" className="btn btn-primary drawer-button">
              Open drawer
            </label>
            <div>
              <label htmlFor="datePicker" className="mr-2">Selecione a data:</label>
              <input
                type="date"
                id="datePicker"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input input-bordered"
              />
            </div>
          </div>

          <div className="flex flex-1 gap-4">
            {/* Lista de pacientes (esquerda) */}
            <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Lista de pacientes</h2>
              {waitingAgendamentos.length > 0 ? (
                <ul className="space-y-2">
                  {waitingAgendamentos.map((agendamento) => (
                    <li
                      key={agendamento.pk}
                      className={`p-2 rounded cursor-pointer ${
                        selectedAgendamento?.pk === agendamento.pk ? "bg-blue-200" : "bg-gray-200"
                      }`}
                      onClick={() => setSelectedAgendamento(agendamento)}
                    >
                      {agendamento.tipo} - Sala: {agendamento.sala} - {new Date(agendamento.dataHoraSala).toLocaleTimeString()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum agendamento em espera para a data selecionada.</p>
              )}
            </div>

            {/* Detalhes do agendamento (direita) */}
            <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
              {selectedAgendamento ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Dados do paciente e botão iniciar atendimento</h2>
                  <div className="space-y-2">
                    <p><strong>ID:</strong> {selectedAgendamento.pk}</p>
                    <p><strong>Tipo:</strong> {selectedAgendamento.tipo}</p>
                    <p><strong>Sala:</strong> {selectedAgendamento.sala}</p>
                    <p><strong>Data/Hora:</strong> {new Date(selectedAgendamento.dataHoraSala).toLocaleString()}</p>
                    <p><strong>Especialista ID:</strong> {selectedAgendamento.especialistaColaboradorId || "N/A"}</p>
                    <p><strong>Paciente ID:</strong> {selectedAgendamento.pacienteId || "N/A"}</p>
                    <p><strong>Recepcionista ID:</strong> {selectedAgendamento.recepcionistaColaboradorId || "N/A"}</p>
                    <p><strong>Responsável ID:</strong> {selectedAgendamento.responsavelId || "N/A"}</p>
                    <p><strong>Unidade Prefixo:</strong> {selectedAgendamento.unidadePrefixo || "N/A"}</p>
                    <p><strong>Data/Hora Criação:</strong> {selectedAgendamento.dataHoraCriacao ? new Date(selectedAgendamento.dataHoraCriacao).toLocaleString() : "N/A"}</p>
                    <p><strong>Status:</strong> {selectedAgendamento.status}</p>
                    <p><strong>Observações:</strong> {selectedAgendamento.observacoes || "N/A"}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {selectedAgendamento.status === "em espera" ? (
                      <>
                        <button
                          className="btn btn-success"
                          onClick={() => updateAgendamentoStatus(selectedAgendamento.pk, "em atendimento")}
                        >
                          Iniciar
                        </button>
                        <button
                          className="btn btn-warning"
                          onClick={() => openEditModal(selectedAgendamento)}
                        >
                          Editar
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-danger"
                        onClick={() => updateAgendamentoStatus(selectedAgendamento.pk, "finalizado")}
                      >
                        Terminar Consulta
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center">Selecione um agendamento para ver os detalhes.</p>
              )}
            </div>
          </div>

          {/* Modal de Edição */}
          {isModalOpen && selectedAgendamento && (
            <div className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Editar Agendamento</h3>
                <div className="py-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Sala</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.sala}
                      onChange={(e) => setEditForm({ ...editForm, sala: e.target.value })}
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Tipo</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.tipo}
                      onChange={(e) => setEditForm({ ...editForm, tipo: e.target.value })}
                      className="input input-bordered"
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Observações</span>
                    </label>
                    <textarea
                      value={editForm.observacoes}
                      onChange={(e) => setEditForm({ ...editForm, observacoes: e.target.value })}
                      className="textarea textarea-bordered"
                    />
                  </div>
                </div>
                <div className="modal-action">
                  <button
                    className="btn btn-primary"
                    onClick={() => updateAgendamentoDetails(selectedAgendamento.pk)}
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
      </div>
      {/* Drawer Lateral */}
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li>
            <a>Item 1</a>
          </li>
          <li>
            <a>Item 2</a>
          </li>
          <li>
            <a>Item 3</a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Medico;