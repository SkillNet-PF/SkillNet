import { useState } from "react";
import { login } from "../services/auth";
import { useAuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { auth0RegisterUrl } from "../services/auth";


function LoginForm() {
  const { setRole } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);
      if (res.success) {
        setRole(res.role);
        navigate("/");
      } else {
        setError("Credenciales inválidas. Intenta nuevamente.");
      }
    } catch {
      setError("Error al conectar con el servidor. Intenta nuevamente.");
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
        Iniciar Sesión
      </h2>


      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... (El resto de tu formulario sigue igual) ... */}

        {/* Input Correo electrónico */}
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            placeholder="ejemplo@correo.com"
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Input Contraseña */}
        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            placeholder="********"
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Entrar
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={auth0RegisterUrl('client','google-oauth2')}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            <span>Google</span>
          </a>
          <a
            href={auth0RegisterUrl('client','github')}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
          >
            <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5" />
            <span>GitHub</span>
          </a>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Crea una nueva
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;