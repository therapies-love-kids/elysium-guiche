import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5432/login", {
        username,
        password,
      });
      if (response.data.success) {
        navigate("/telaPrincipal");
      } else {
        setError("Usuário ou senha inválidos");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    }
  };

  return (
    <div className="hero h-screen bg-base-200">
      <div className="hero-content w-1/2 flex-col flex-row-reverse">
        <div className="card flex-shrink-0 w-2/3  shadow-2xl bg-base-100">
          <div className="card-body">
            <h2 className="text-5xl font-bold">Elysium-Guichê</h2>
            <br />
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit} className="form-control gap-2">
              <label className="input input-bordered flex items-center gap-2">
                <input 
                  type="text" 
                  className="grow" 
                  placeholder="Username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <input 
                  type="password" 
                  className="grow" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">Entrar</button>
              </div>
            </form>
            <div className="text-center mt-4">
              <a href="#" className="text-sm">
                Esqueceu sua senha?
              </a>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 right-0 mb-4 mr-4">
          <button onClick={() => navigate("/Guiche")} className="btn btn-primary btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
