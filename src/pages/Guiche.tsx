import React, { useState, useEffect } from "react";
import axios from "axios";

interface Agendamento {
  codigo: string;
  sala: string;
  dataHoraSala: string;
}

interface LocalInfo {
  cidade: string;
  temperatura: string;
  dataHora: string;
}

function Guiche() {
  const [currentAgendamentos, setCurrentAgendamentos] = useState<Agendamento[]>([]);
  const [previousAgendamentos, setPreviousAgendamentos] = useState<Agendamento[]>([]);
  const [localInfo, setLocalInfo] = useState<LocalInfo>({
    cidade: "Carregando...",
    temperatura: "",
    dataHora: "",
  });

  const fetchAgendamentos = async () => {
    try {
      console.log("Iniciando requisição para o backend: http://localhost:8080/agendamentos/current");
      const currentResponse = await axios.get("http://localhost:8080/agendamentos/current", {
        withCredentials: true,
      });

      console.log("Resposta recebida do backend:", currentResponse);

      if (currentResponse.status === 200 && currentResponse.data) {
        const newCurrentList = currentResponse.data;
        console.log("Agendamentos atuais encontrados:", newCurrentList);

        // Ordena os agendamentos por dataHoraSala (do mais recente para o mais antigo)
        const sortedAgendamentos = [...newCurrentList].sort((a, b) =>
          new Date(b.dataHoraSala).getTime() - new Date(a.dataHoraSala).getTime()
        );

        // Atualiza a lista de agendamentos atuais
        setCurrentAgendamentos(sortedAgendamentos);

        // Adiciona os agendamentos que saíram da lista atual à lista de "previous"
        if (currentAgendamentos.length > 0) {
          const newPrevious = currentAgendamentos.filter(
            (oldAgendamento) =>
              !sortedAgendamentos.some((newAgendamento: Agendamento) => newAgendamento.codigo === oldAgendamento.codigo)
          );
          if (newPrevious.length > 0) {
            setPreviousAgendamentos((prev) => {
              const updatedList = [...newPrevious, ...prev];
              return updatedList.slice(0, 4); // Limita a 4 agendamentos anteriores
            });
          }
        }
      } else if (currentResponse.status === 204) {
        console.log("Nenhum agendamento em andamento (status 204).");
        setCurrentAgendamentos([]);
      } else {
        console.log("Resposta inesperada do backend:", currentResponse.status);
        setCurrentAgendamentos([]);
      }
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setCurrentAgendamentos([]);
    }
  };

  useEffect(() => {
    fetchAgendamentos();
    const intervalId = setInterval(fetchAgendamentos, 5000);
    return () => clearInterval(intervalId);
  }, [currentAgendamentos]);

  useEffect(() => {
    const atualizarInformacoes = () => {
      const agora = new Date();
      const dia = agora.getDate().toString().padStart(2, "0");
      const mes = (agora.getMonth() + 1).toString().padStart(2, "0");
      const ano = agora.getFullYear();
      const hora = agora.getHours().toString().padStart(2, "0");
      const minuto = agora.getMinutes().toString().padStart(2, "0");
      const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${minuto}`;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}¤t=temperature_2m&timezone=auto&forecast_days=1`;

            fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Erro na API: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

                fetch(nominatimUrl)
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error("Erro na geocodificação reversa");
                    }
                    return response.json();
                  })
                  .then((nominatimData) => {
                    const cidade =
                      nominatimData.address.city ||
                      nominatimData.address.town ||
                      nominatimData.address.village ||
                      "Anápolis";
                    const temperatura = Math.round(data.current.temperature_2m);

                    setLocalInfo({
                      cidade: cidade,
                      temperatura: `${temperatura}°C`,
                      dataHora: dataHoraFormatada,
                    });
                  })
                  .catch((error) => {
                    console.error("Erro na geocodificação reversa:", error);
                    setLocalInfo({
                      cidade: "Cidade não encontrada",
                      temperatura: `${Math.round(data.current.temperature_2m)}°C`,
                      dataHora: dataHoraFormatada,
                    });
                  });
              })
              .catch((error) => {
                console.error("Erro ao obter dados do Open-Meteo:", error);
                setLocalInfo({
                  cidade: "Erro ao carregar",
                  temperatura: "",
                  dataHora: dataHoraFormatada,
                });
              });
          },
          (error) => {
            console.error("Erro ao obter localização:", error);
            setLocalInfo({
              cidade: "Localização indisponível",
              temperatura: "",
              dataHora: dataHoraFormatada,
            });
          }
        );
      } else {
        setLocalInfo({
          cidade: "Geolocalização não suportada",
          temperatura: "",
          dataHora: dataHoraFormatada,
        });
      }
    };

    atualizarInformacoes();
    const intervalId = setInterval(atualizarInformacoes, 180000);
    return () => clearInterval(intervalId);
  }, []);

  // Pega o agendamento mais recente (se houver)
  const mostRecentAgendamento = currentAgendamentos.length > 0 ? currentAgendamentos[0] : null;

  // Pega os outros agendamentos (exceto o mais recente) para os quadrados menores
  const otherAgendamentos = currentAgendamentos.slice(1);

  return (
    <div className="h-screen w-screen flex flex-col gap-2 p-4 bg-base-200">
      <div className="h-[85%] flex gap-2">
        <div className="w-[20%] h-full">
          <img src="teste.png" alt="Guiche" className="h-full w-full" />
        </div>
        <div className="w-[80%] h-full flex flex-col gap-2">
          {/* Quadrado de destaque (mais recente) */}
          <div className="flex h-[50%] rounded-3xl shadow-md bg-base-100">
            <div className="m-auto">
              {mostRecentAgendamento ? (
                <>
                  <p className="text-9xl">
                    SENHA: <b>{mostRecentAgendamento.codigo}</b>
                  </p>
                  <p className="text-9xl">
                    CONSULTÓRIO: <b>{mostRecentAgendamento.sala}</b>
                  </p>
                </>
              ) : (
                <p className="text-9xl">Nenhum agendamento em andamento</p>
              )}
            </div>
          </div>
          {/* Quadrados menores (outros agendamentos em atendimento) */}
          <div className="h-[50%] grid grid-cols-2 gap-4">
            {otherAgendamentos.map((agendamento, index) => (
              <div
                key={index}
                className="shadow-md rounded-3xl p-6 bg-base-100 w-full"
              >
                <p className="text-5xl">
                  SENHA: <b>{agendamento.codigo}</b>
                </p>
                <p className="text-5xl">
                  CONSULTÓRIO: <b>{agendamento.sala}</b>
                </p>
              </div>
            ))}
            {/* Preenche os quadrados restantes com placeholders */}
            {Array.from({ length: 4 - otherAgendamentos.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="shadow-md rounded-3xl p-6 bg-base-100 w-full opacity-50"
              >
                <p className="text-5xl">SENHA: <b>---</b></p>
                <p className="text-5xl">CONSULTÓRIO: <b>---</b></p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-[15%] gap-2 hero flex items-center justify-center">
        <p className="text-4xl">
          {localInfo.cidade} {localInfo.temperatura} {localInfo.dataHora}
        </p>
      </div>
    </div>
  );
}

export default Guiche;