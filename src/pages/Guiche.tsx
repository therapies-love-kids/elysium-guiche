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
      const currentResponse = await axios.get("http://localhost:8080/agendamentos/ematendimento", {
        withCredentials: true,
      });

      console.log("Resposta recebida do backend:", currentResponse);

      if (currentResponse.status === 200 && currentResponse.data) {
        const newCurrentList = currentResponse.data;
        console.log("Agendamentos atuais encontrados:", newCurrentList);

        const sortedAgendamentos = [...newCurrentList].sort((a, b) =>
          new Date(b.dataHoraSala).getTime() - new Date(a.dataHoraSala).getTime()
        );

        setCurrentAgendamentos(sortedAgendamentos);

        if (currentAgendamentos.length > 0) {
          const newPrevious = currentAgendamentos.filter(
            (oldAgendamento) =>
              !sortedAgendamentos.some((newAgendamento: Agendamento) => newAgendamento.codigo === oldAgendamento.codigo)
          );
          if (newPrevious.length > 0) {
            setPreviousAgendamentos((prev) => {
              const updatedList = [...newPrevious, ...prev];
              return updatedList.slice(0, 4);
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

            // Corrigir a URL do Open-Meteo (remover "¤t" e usar "current")
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto&forecast_days=1`;

            fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Erro na API Open-Meteo: ${response.status} - ${response.statusText}`);
                }
                return response.json();
              })
              .then((data) => {
                // URL do Nominatim com headers para identificar o User-Agent
                const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

                fetch(nominatimUrl, {
                  headers: {
                    "User-Agent": "MinhaApp/1.0 (contato@meuemail.com)", // Substitua por um identificador único e seu contato
                  },
                })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(`Erro na API Nominatim: ${response.status} - ${response.statusText}`);
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
                    console.error("Erro na geocodificação reversa (Nominatim):", error);
                    // Fallback: usar uma cidade padrão e a temperatura do Open-Meteo
                    setLocalInfo({
                      cidade: "Anápolis",
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
    const intervalId = setInterval(atualizarInformacoes, 180000); // 3 minutos
    return () => clearInterval(intervalId);
  }, []);

  // Função para determinar a cor da barra com base nas 3 primeiras letras do código (senha)
  const getBarColor = (codigo: string) => {
    if (!codigo || codigo === "---") return "bg-gray-200"; // Cor padrão para placeholders
    const firstThreeChars = codigo.slice(0, 3).toUpperCase(); // Pega as 3 primeiras letras
    switch (firstThreeChars) {
      case "FON": // Fonoaudiologia
        return "bg-pink-400"; // pink-400
      case "PSI": // Psicologia
        return "bg-blue-400";
      case "TOC": // Terapia Ocupacional
        return "bg-green-600";
      case "FIS": // Fisioterapia
        return "bg-purple-600";
      case "MUS": // Musicoterapia
        return "bg-yellow-400";
      case "PSN": // Psicomotricidade
        return "bg-red-600";
      case "PED": // Pedagogia
        return "bg-gray-600";
      case "NRO": // Neurologia
        return "bg-yellow-200";
      default:
        return "bg-gray-500";
    }
  };

  const mostRecentAgendamento = currentAgendamentos.length > 0 ? currentAgendamentos[0] : null;
  const otherAgendamentos = currentAgendamentos.slice(1);

  return (
    <div className="h-screen w-screen flex flex-col gap-2 p-4 bg-base-200 bg-blue-100">
      <div className="h-[85%] flex gap-2">
        <div className="w-full h-full flex flex-col gap-2">
          {/* Quadrado de destaque (mais recente) */}
          <div className="flex h-[60%] rounded-3xl shadow-md bg-base-100 flex-col">
            <div className="m-auto h-max">
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
                <p className="text-9xl">Aguardando...</p>
              )}
            </div>
            {/* Barra colorida na parte inferior */}
            <div
              className={`h-[10%] rounded-b-3xl ${
                mostRecentAgendamento ? getBarColor(mostRecentAgendamento.codigo) : getBarColor("---")
              }`}
            ></div>
          </div>
          {/* Quadrados menores (outros agendamentos em atendimento) */}
          <div className="h-[50%] grid grid-cols-2 gap-4">
            {otherAgendamentos.map((agendamento, index) => (
              <div
                key={index}
                className="shadow-md rounded-3xl bg-base-100 w-full flex flex-col"
              >
                <div className="p-6">
                  <p className="text-5xl">
                    SENHA: <b>{agendamento.codigo}</b>
                  </p>
                  <p className="text-5xl">
                    CONSULTÓRIO: <b>{agendamento.sala}</b>
                  </p>
                </div>
                {/* Barra colorida na parte inferior */}
                <div className={`h-[10%] rounded-b-3xl ${getBarColor(agendamento.codigo)}`}></div>
              </div>
            ))}
            {/* Preenche os quadrados restantes com placeholders */}
            {Array.from({ length: 4 - otherAgendamentos.length }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="shadow-md rounded-3xl bg-base-100 w-full flex flex-col opacity-100"
              >
                <div className="p-6">
                  <p className="text-5xl">SENHA: <b>---</b></p>
                  <p className="text-5xl">CONSULTÓRIO: <b>---</b></p>
                </div>
                {/* Barra colorida na parte inferior para placeholders */}
                <div className={`h-[10%] rounded-b-3xl ${getBarColor("---")}`}></div>
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