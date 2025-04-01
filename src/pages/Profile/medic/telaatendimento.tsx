import React, { useState, useEffect } from "react";
import axios from "axios";

interface Agendamento {
  pk: number; // Alterado de "id" para "pk"
  especialistaColaboradorId: number | null;
  pacienteId: number | null;
  recepcionistaColaboradorId: number | null;
  responsavelId: number | null;
  unidadePrefixo: string | null;
  dataHoraCriacao: string | null;
  dataHoraSala: string;
  sala: string;
  tipo: string | null;
  status: string | null;
  observacoes: string | null;
}

function Medico() {
  const [waitingAgendamentos, setWaitingAgendamentos] = useState<Agendamento[]>([]);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);

  // Busca os agendamentos em espera
  const fetchWaitingAgendamentos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/agendamentos/waiting", {
        withCredentials: true,
      });
      if (response.status === 200) {
        setWaitingAgendamentos(response.data);
      } else if (response.status === 204) {
        setWaitingAgendamentos([]);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos em espera:", err);
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
        // Atualiza a lista de agendamentos em espera
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

  useEffect(() => {
    fetchWaitingAgendamentos();
    const intervalId = setInterval(fetchWaitingAgendamentos, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col p-4 bg-gray-100">
      {/* Botão "Open drawer" */}
      <div className="mb-4">
        <button className="btn btn-primary">Open drawer</button>
      </div>

      <div className="flex flex-1 gap-4">
        {/* Lista de pacientes (esquerda) */}
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Lista de pacientes</h2>
          {waitingAgendamentos.length > 0 ? (
            <ul className="space-y-2">
              {waitingAgendamentos.map((agendamento) => (
                <li
                  key={agendamento.pk} // Alterado de "id" para "pk"
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
            <p>Nenhum agendamento em espera.</p>
          )}
        </div>

        {/* Detalhes do agendamento (direita) */}
        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
          {selectedAgendamento ? (
            <>
              <h2 className="text-xl font-bold mb-4">Dados do paciente e botão iniciar atendimento</h2>
              <div className="space-y-2">
                <p><strong>ID:</strong> {selectedAgendamento.pk}</p> {/* Alterado de "id" para "pk" */}
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
              <div className="mt-4">
                {selectedAgendamento.status === "em espera" ? (
                  <button
                    className="btn btn-success"
                    onClick={() => updateAgendamentoStatus(selectedAgendamento.pk, "em atendimento")} // Alterado de "id" para "pk"
                  >
                    Iniciar
                  </button>
                ) : (
                  <button
                    className="btn btn-danger"
                    onClick={() => updateAgendamentoStatus(selectedAgendamento.pk, "finalizado")} // Alterado de "id" para "pk"
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
    </div>
  );
}

export default Medico;