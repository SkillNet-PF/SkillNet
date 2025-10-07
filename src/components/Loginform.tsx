import { useState } from "react";
// import { login } from "../services/api"; // Descomentarás esto cuando el backend esté listo
import { useAuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

// --- DATOS SIMULADOS PARA PRUEBAS (DOBLE ROL) ---
const USER_EMAIL = "user@skillnet.com";       // Credenciales de Usuario
const USER_PASSWORD = "password";
const USER_ROLE = "user";

const PROVIDER_EMAIL = "provider@skillnet.com"; // Credenciales de Proveedor
const PROVIDER_PASSWORD = "password";
const PROVIDER_ROLE = "provider";
// ------------------------------------------------

function LoginForm() {
  const { setRole } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // *******************************************************************
    // LÓGICA DE SIMULACIÓN DE ROLES
    // *******************************************************************

    // 1. Simular Login de USUARIO (Cliente)
    if (email === USER_EMAIL && password === USER_PASSWORD) {
      setRole(USER_ROLE); // Establece el rol como 'user'
      navigate("/");
      return;
    }

    // 2. Simular Login de PROVEEDOR
    if (email === PROVIDER_EMAIL && password === PROVIDER_PASSWORD) {
      setRole(PROVIDER_ROLE); // Establece el rol como 'provider'
      navigate("/");
      return;
    }

    // *******************************************************************
    // LÓGICA DE BACKEND REAL (MANTENIDA EN CASO DE NECESITARLA MÁS TARDE)
    // *******************************************************************
    /*
        const res = await login(email, password); 
        if (res.success) {
          setRole(res.role);
          navigate("/");
        } else {
          setError("Credenciales inválidas. Intenta nuevamente.");
        }
        */

    // Si no coincide con ninguna simulación, muestra el error de credenciales.
    setError("Credenciales inválidas. Intenta nuevamente.");
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