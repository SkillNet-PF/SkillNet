import { useEffect, useState } from "react";
import { login } from "../services/auth";
import { useAuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { auth0RegisterUrl } from "../services/auth";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

function LoginForm() {
  const { setRole } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validations, setValidations] = useState({

    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
    minLength: false,
  })

  const [emailValid, setEmailValid] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(regex.test(email));
  }, [email]);


  useEffect(() => {
    setValidations({
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSymbol: /[^A-Za-z0-9]/.test(password),
      minLength: password.length >= 8,
    });
  }, [password]
  );

  const isFormValid =
    emailValid &&
    validations.hasUppercase &&
    validations.hasLowercase &&
    validations.hasNumber &&
    validations.hasSymbol &&
    validations.minLength;



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailValid) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    try {
      const res = await login(email, password);
      if (res.success) {
        setRole(res.role === "client" ? "user" : res.role);
        navigate("/");
      } else {
        setError("Credenciales inválidas. Intenta nuevamente.");
      }
    } catch {
      setError("Error al conectar con el servidor. Intenta nuevamente.");
    }
  };

  const renderValidation = (isValid: boolean, text: string) => (
    <p
      className={`flex items-center text-sm transition-colors duration-300 ${isValid ? "text-green-600" : "text-gray-500"
        }`}
    >
      {isValid ? (
        <FaCheckCircle className="mr-2" />
      ) : (
        <FaTimesCircle className="mr-2" />
      )}
      {text}
    </p>
  );

  return (
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
      <h2 className="text-3xl font-semibold text-center text-blue-600 mb-6">
        Iniciar Sesión
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Correo electrónico */}
        <div>
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-medium mb-1"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            placeholder="ejemplo@correo.com"
            className={`w-full border ${emailValid ? "border-gray-300" : "border-red-500"
              } p-2 rounded-lg focus:outline-none focus:ring-2 ${emailValid ? "focus:ring-blue-400" : "focus:ring-red-400"
              } transition`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {!emailValid && (
            <p className="text-red-500 text-xs mt-1">
              Correo electrónico inválido.
            </p>
          )}
        </div>

        {/* Input Contraseña */}
        <div>
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-medium mb-1"
          >
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="********"
              className="w-full border border-gray-300 p-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {/* Validaciones dinámicas */}
          <div className="mt-2 space-y-1">
            {renderValidation(validations.hasUppercase, "Una letra mayúscula")}
            {renderValidation(validations.hasLowercase, "Una letra minúscula")}
            {renderValidation(validations.hasNumber, "Un número")}
            {renderValidation(validations.hasSymbol, "Un símbolo (!, $, #, etc.)")}
            {renderValidation(validations.minLength, "Mínimo 8 caracteres")}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}


        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full p-2 rounded-lg font-medium transition
    ${isFormValid
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Entrar
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={auth0RegisterUrl("client", "google-oauth2")}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Google</span>
          </a>
          <a
            href={auth0RegisterUrl("client", "github")}
            className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub"
              className="w-5 h-5"
            />
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
