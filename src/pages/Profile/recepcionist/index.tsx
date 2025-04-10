import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { Calendar } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) =>
    format(date, formatStr, { locale: ptBR }),
  parse: (dateStr: string, formatStr: string) =>
    parse(dateStr, formatStr, new Date(), { locale: ptBR }),
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales: { "pt-BR": ptBR },
});

// Interface ajustada para corresponder ao AgendamentoDTO do backend
interface Agendamento {
  pk: number;
  especialistaColaboradorId: number;
  pacienteId: number;
  recepcionistaColaboradorId: number | null;
  responsavelId: number | null;
  unidadePrefixo: string;
  dataHoraCriacao: string;
  dataHora: string;
  sala: string;
  tipo: string;
  status: string;
  observacoes: string | null;
}

function Recepcionist() {
  const { perfil, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [unidadePrefixo, setUnidadePrefixo] = useState<string | null>(null);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgendamento, setNewAgendamento] = useState({
    sala: "",
    dataHora: "", // Ajustado para corresponder ao DTO (dataHora)
    tipo: "",
    status: "em_espera", // Ajustado para corresponder ao valor padrão do backend
    observacoes: "",
    especialistaColaboradorId: null as number | null,
    pacienteId: null as number | null,
    recepcionistaColaboradorId: null as number | null,
    responsavelId: null as number | null,
    unidadePrefixo: "",
    dataHoraCriacao: new Date().toISOString(),
  });

  const logoSrc = "LOVE KIDS.png";
  const addmedic = "add-medic.png";
  const addpatient = "add-patient.png";
  const bloco = "memo-pencil-svgrepo-com.svg";
  const addconvenio = "add-convenio.png";
  // const config = "config.png";

  const pageProfile = "recepcionist";

  const checkAccess = async () => {
    const nome = localStorage.getItem("nome");
    if (!nome || !perfil) {
      console.log(
        "Nome ou perfil não encontrado no localStorage. Redirecionando para login."
      );
      setIsAuthorized(false);
      return;
    }

    const authorizationKey = `authorized_${window.location.pathname}`;
    const isPreviouslyAuthorized =
      localStorage.getItem(authorizationKey) === "true";
    if (isPreviouslyAuthorized) {
      console.log("Página já autorizada anteriormente.");
      setIsAuthorized(true);
      return;
    }

    try {
      console.log("Verificando acesso para o usuário:", nome);
      const response = await axios.post(
        "http://localhost:8080/usuarios/checkAccess",
        null,
        {
          params: { nome, pageProfile },
        }
      );
      const hasAccess = response.data.hasAccess;
      console.log("Resposta do checkAccess:", response.data);
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

  const fetchUnidadePrefixo = async () => {
    const nome = localStorage.getItem("nome");
    if (!nome) {
      console.log("Nome não encontrado no localStorage.");
      return;
    }

    try {
      console.log("Buscando unidadePrefixo para o usuário:", nome);
      const userResponse = await axios.get(
        `http://localhost:8080/usuarios/getProfileByUserName/${nome}`
      );
      console.log("Resposta do getProfileByUserName:", userResponse.data);
      const unidadePrefixo = userResponse.data.unidadePrefixo || "TES1";
      setUnidadePrefixo(unidadePrefixo);
      setNewAgendamento((prev) => ({ ...prev, unidadePrefixo }));
    } catch (err) {
      console.error("Erro ao buscar unidadePrefixo:", err);
      setUnidadePrefixo("default");
    }
  };

  const fetchAgendamentos = async () => {
    if (!unidadePrefixo) {
      console.log("unidadePrefixo não definido. Aguardando...");
      return;
    }

    try {
      console.log("Buscando agendamentos para unidadePrefixo:", unidadePrefixo);
      const response = await axios.get(
        `http://localhost:8080/api/agendamentos/by-unidade-prefixo/${unidadePrefixo}`
      );
      console.log("Resposta do fetchAgendamentos:", response.data);
      setAgendamentos(response.data);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setAgendamentos([]);
    }
  };

  const fetchCalendarEvents = async () => {
    try {
      console.log("Buscando todos os agendamentos para o calendário...");
      const response = await axios.get(
        "http://localhost:8080/api/agendamentos"
      );
      console.log("Resposta do fetchCalendarEvents:", response.data);
      const events = response.data
        .map((agendamento: Agendamento) => {
          const start = new Date(agendamento.dataHora); // Ajustado para usar dataHora
          if (isNaN(start.getTime())) {
            console.error("Data inválida para agendamento:", agendamento);
            return null;
          }
          return {
            title: `${agendamento.tipo} - Sala: ${agendamento.sala}`,
            start,
            end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hora de duração
            allDay: false,
            resource: agendamento,
          };
        })
        .filter((event: any) => event !== null);
      console.log("Eventos mapeados para o calendário:", events);
      setCalendarEvents(events);
    } catch (err) {
      console.error("Erro ao buscar eventos para o calendário:", err);
      setCalendarEvents([]);
    }
  };

  const createAgendamento = async () => {
    try {
      const agendamentoToSend = {
        ...newAgendamento,
        especialistaColaboradorId:
          newAgendamento.especialistaColaboradorId || null,
        pacienteId: newAgendamento.pacienteId || null,
        recepcionistaColaboradorId:
          newAgendamento.recepcionistaColaboradorId || null,
        responsavelId: newAgendamento.responsavelId || null,
        dataHora: new Date(newAgendamento.dataHora).toISOString(),
        dataHoraCriacao: new Date().toISOString(),
      };
      console.log("Enviando novo agendamento:", agendamentoToSend);
      const response = await axios.post(
        "http://localhost:8080/api/agendamentos",
        agendamentoToSend
      );
      console.log("Resposta do createAgendamento:", response.data);
      if (response.status === 200) {
        await fetchAgendamentos();
        await fetchCalendarEvents();
        setIsModalOpen(false);
        setNewAgendamento({
          sala: "",
          dataHora: "",
          tipo: "",
          status: "em_espera",
          observacoes: "",
          especialistaColaboradorId: null,
          pacienteId: null,
          recepcionistaColaboradorId: null,
          responsavelId: null,
          unidadePrefixo: unidadePrefixo || "",
          dataHoraCriacao: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Erro ao criar agendamento:", err);
    }
  };

  useEffect(() => {
    checkAccess();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchUnidadePrefixo();
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (unidadePrefixo) {
      fetchAgendamentos();
      fetchCalendarEvents();
    }
  }, [unidadePrefixo]);

  useEffect(() => {
    if (isAuthorized === false) {
      logout();
      navigate("/");
    }
  }, [isAuthorized, navigate, logout]);

  if (isAuthorized === null) {
    return <div>Carregando...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col p-4 bg-blue-100">
      <div className="absolute top-0 right-0 p-4">
        <img src={logoSrc} alt="Logo" className="h-32 w-46" />
      </div>

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
              to="/addconvenio"
              className="tooltip"
              data-tip="Adicionar convenio"
              onClick={(e) => {
                e.preventDefault();
                setUserOnlineAndNavigate("/addconvenio");
              }}
            >
              <img src={addconvenio} alt="Logo" className="h-10 w-10" />
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

      <div className="mt-2 flex flex-1 gap-4 ">
        <div className="w-1/3 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Agendamentos</h2>
          <button
            className="btn btn-primary mb-4"
            onClick={() => setIsModalOpen(true)}
          >
            Adicionar Agendamento
          </button>
          {agendamentos.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto">
              {" "}
              {/* Added fixed height and scroll */}
              <ul className="space-y-2">
                {agendamentos.map((agendamento) => (
                  <li key={agendamento.pk} className="p-2 rounded bg-base-200">
                    <p>
                      <strong>Tipo:</strong> {agendamento.tipo}
                    </p>
                    <p>
                      <strong>Sala:</strong> {agendamento.sala}
                    </p>
                    <p>
                      <strong>Data/Hora:</strong>{" "}
                      {format(
                        new Date(agendamento.dataHora),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR }
                      )}
                    </p>
                    <p>
                      <strong>Status:</strong> {agendamento.status}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>Nenhum agendamento encontrado para esta unidade.</p>
          )}
        </div>

        <div className="w-2/3 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Agenda</h2>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            messages={{
              today: "Hoje",
              previous: "Anterior",
              next: "Próximo",
              month: "Mês",
              week: "Semana",
              day: "Dia",
              agenda: "Agenda",
              date: "Data",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "Não há eventos neste período.",
              showMore: (total) => `+${total} mais`,
            }}
            onSelectEvent={(event) =>
              alert(
                `Agendamento: ${event.title}\nData: ${format(
                  event.start,
                  "dd/MM/yyyy HH:mm",
                  { locale: ptBR }
                )}`
              )
            }
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box mx-auto max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Adicionar Agendamento</h3>
            <div className="grid grid-cols-2 gap-6">
              {/* Coluna 1 */}
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sala</span>
                  </label>
                  <input
                    type="text"
                    value={newAgendamento.sala}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        sala: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Data/Hora</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newAgendamento.dataHora}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        dataHora: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Tipo</span>
                  </label>
                  <input
                    type="text"
                    value={newAgendamento.tipo}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        tipo: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Status</span>
                  </label>
                  <select
                    value={newAgendamento.status}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        status: e.target.value,
                      })
                    }
                    className="select select-bordered w-full"
                  >
                    <option value="em_espera">Em Espera</option>
                    <option value="em_atendimento">Em Atendimento</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Observações</span>
                  </label>
                  <textarea
                    value={newAgendamento.observacoes || ""}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        observacoes: e.target.value,
                      })
                    }
                    className="textarea textarea-bordered w-full"
                  />
                </div>
              </div>

              {/* Coluna 2 */}
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Especialista ID</span>
                  </label>
                  <input
                    type="number"
                    value={newAgendamento.especialistaColaboradorId || ""}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        especialistaColaboradorId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Paciente ID</span>
                  </label>
                  <input
                    type="number"
                    value={newAgendamento.pacienteId || ""}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        pacienteId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Recepcionista ID</span>
                  </label>
                  <input
                    type="number"
                    value={newAgendamento.recepcionistaColaboradorId || ""}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        recepcionistaColaboradorId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Responsável ID</span>
                  </label>
                  <input
                    type="number"
                    value={newAgendamento.responsavelId || ""}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        responsavelId: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      })
                    }
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Unidade Prefixo</span>
                  </label>
                  <input
                    type="text"
                    value={newAgendamento.unidadePrefixo || ""}
                    onChange={(e) =>
                      setNewAgendamento({
                        ...newAgendamento,
                        unidadePrefixo: e.target.value,
                      })
                    }
                    className="input input-bordered w-full"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button className="btn btn-primary" onClick={createAgendamento}>
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

export default Recepcionist;
