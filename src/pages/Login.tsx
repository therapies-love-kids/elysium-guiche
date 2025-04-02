import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [profileRoute, setProfileRoute] = useState("");
  const guiche = "queue-svgrepo-com.svg";

  const navigate = useNavigate();

  const handleUsernameBlur = async () => {
    if (!username) return;
    try {
      const response = await axios.get(`http://localhost:8080/usuarios/getProfileByUserName/${username}`);
      if (response.data) {
        setProfileRoute(response.data.toLowerCase()); // Ex: "admin", "user", etc.
      }
    } catch (err: any) {
      console.error("Erro ao buscar perfil:", err.response?.data || err.message);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:8080/usuarios/validateUserPassword", null, {
        params: {
          nome: username,
          password: password,
        },
      });
      
      if (response.data) {
        navigate(`/${profileRoute}`); // Navega para /admin, /user, etc.
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
        <div className="card flex-shrink-0 w-2/3 shadow-2xl bg-base-100 hero-content">
          <div className="card-body flex flex-col">
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
                  onBlur={handleUsernameBlur}
                />
              </label>
              <label className="input input-bordered flex items-center gap-2 mt-1">
                <input 
                  type="password" 
                  className="grow" 
                  placeholder="Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <div className="form-control mt-6 flex justify-center">
                <button type="submit" className="btn btn-primary">Entrar</button>
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
          <button onClick={() => navigate("/Guiche")} className="btn btn-primary  btn-circle btn-xl">
            <img className="w-8 h-10" src={guiche} alt="Guiche" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;