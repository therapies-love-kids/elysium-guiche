import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function Guiche() {
    const [localInfo, setLocalInfo] = useState({
        cidade: 'Carregando...',
        temperatura: '',
        dataHora: '',
    });

    useEffect(() => {
        const atualizarInformacoes = () => {
            const agora = new Date();
            const dia = agora.getDate().toString().padStart(2, '0');
            const mes = (agora.getMonth() + 1).toString().padStart(2, '0');
            const ano = agora.getFullYear();
            const hora = agora.getHours().toString().padStart(2, '0');
            const minuto = agora.getMinutes().toString().padStart(2, '0');
            const dataHoraFormatada = `${dia}/${mes}/${ano} ${hora}:${minuto}`;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                        // Usando Open-Meteo API
                        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto&forecast_days=1`;

                        fetch(url)
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(`Erro na API: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then((data) => {
                                // Open-Meteo não fornece diretamente o nome da cidade. Precisamos de geocodificação reversa.
                                // Usaremos a API do OpenStreetMap (Nominatim) para isso.
                                const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

                                fetch(nominatimUrl)
                                    .then(response => {
                                        if (!response.ok) {
                                            throw new Error("Erro na geocodificação reversa");
                                        }
                                        return response.json();
                                    })
                                    .then(nominatimData => {
                                        const cidade = nominatimData.address.city || nominatimData.address.town || nominatimData.address.village || "Anápolis";
                                        const temperatura = Math.round(data.current.temperature_2m);

                                        setLocalInfo({
                                            cidade: cidade,
                                            temperatura: `${temperatura}°C`,
                                            dataHora: dataHoraFormatada,
                                        });
                                    })
                                    .catch(error => {
                                        console.error("Erro na geocodificação reversa:", error);
                                         setLocalInfo({ //Mantem a temperatura, mesmo sem cidade
                                            cidade: "Cidade não encontrada",
                                            temperatura: `${Math.round(data.current.temperature_2m)}°C`,
                                            dataHora: dataHoraFormatada
                                        });
                                    });

                            })
                            .catch((error) => {
                                console.error('Erro ao obter dados do Open-Meteo:', error);
                                setLocalInfo({
                                    cidade: 'Erro ao carregar',
                                    temperatura: '',
                                    dataHora: dataHoraFormatada,
                                });
                            });
                    },
                    (error) => {
                        console.error('Erro ao obter localização:', error);
                        setLocalInfo({
                            cidade: 'Localização indisponível',
                            temperatura: '',
                            dataHora: dataHoraFormatada,
                        });
                    }
                );
            } else {
                setLocalInfo({
                    cidade: 'Geolocalização não suportada',
                    temperatura: '',
                    dataHora: dataHoraFormatada,
                });
            }
        };

        atualizarInformacoes();
        const intervalId = setInterval(atualizarInformacoes, 180000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col gap-2 p-4 bg-base-200">
            <div className="h-[85%] flex gap-2">
                <div className="w-[20%] h-full">
                    <img src="teste.png" alt="Guiche" className="h-full w-full" />
                </div>
                <div className="w-[80%] h-full flex flex-col gap-2">
                    <div className="flex h-[50%] rounded-3xl shadow-md bg-base-100">
                        <div className="m-auto">
                            <p className="text-9xl">
                                SENHA: <b>9120</b>
                            </p>
                            <p className="text-9xl">
                                CONSULTÓRIO: <b>04</b>
                            </p>
                        </div>
                    </div>
                    <div className="h-[50%] grid grid-cols-2 gap-4">
                        <div className="shadow-md rounded-3xl p-6 bg-base-100 w-full">
                            <p className="text-5xl">
                                SENHA: <b>9120</b>
                            </p>
                            <p className="text-5xl">
                                CONSULTÓRIO: <b>04</b>
                            </p>
                        </div>
                        <div className="shadow-md rounded-3xl p-6 bg-base-100 w-full">
                            <p className="text-5xl">
                                SENHA: <b>9120</b>
                            </p>
                            <p className="text-5xl">
                                CONSULTÓRIO: <b>04</b>
                            </p>
                        </div>
                        <div className="shadow-md rounded-3xl p-6 bg-base-100 w-full">
                            <p className="text-5xl">
                                SENHA: <b>9120</b>
                            </p>
                            <p className="text-5xl">
                                CONSULTÓRIO: <b>04</b>
                            </p>
                        </div>
                        <div className="shadow-md rounded-3xl p-6 bg-base-100 w-full">
                            <p className="text-5xl">
                                SENHA: <b>9120</b>
                            </p>
                            <p className="text-5xl">
                                CONSULTÓRIO: <b>04</b>
                            </p>
                        </div>
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