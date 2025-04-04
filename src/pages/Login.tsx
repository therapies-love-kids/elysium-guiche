import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const guiche = "queue-svgrepo-com.svg";
  const backgd = "LKBG.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/usuarios/validateUserPassword", null, {
        params: { nome: username, senha: password },
      });

      if (response.data.perfil) {
        login(username, response.data.perfil);
        navigate(`/${response.data.perfil.toLowerCase()}`);
      } else {
        setError("Usuário ou senha inválidos");
      }
    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Erro ao conectar com o servidor");
    }
  };

  return (
    <div
      className="hero h-screen bg-base-200"
      style={{
        backgroundImage: `url(${backgd})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      }}
    >
      <div className="hero-content w-1/2 flex-col flex-row-reverse">
        <div className="card flex-shrink-0 w-2/3 shadow-2xl bg-white bg-opacity-65 hero-content">
          <div className="card-body flex flex-col">
            <h2 className="text-7xl font-KampungOrange">Equilibrium</h2>
            <br />
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="form-control gap-2">
              <label className="input input-bordered flex items-center gap-2">
                <input
                  type="text"
                  className="grow"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className="input input-bordered flex items-center gap-2 mt-1">
                <input
                  type="password"
                  className="grow"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className="form-control mt-6 flex justify-center">
                <button type="submit" className="btn btn-primary">
                  Entrar
                </button>
              </div>
            </form>
            <div className="text-center mt-4">
              <Link to="/helpPassword" className="text-sm">
                Esqueceu sua senha?
              </Link>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 right-0 mb-6 mr-6">
          <button onClick={() => navigate("/Guiche")} className="btn btn-primary btn-circle btn-xl">
            <img className="w-8 h-10 filter invert" src={guiche} alt="Guiche" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;