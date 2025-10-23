import { FaUserCircle } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const isActive = (path: string) => pathname.startsWith(path);
  const isLoggedIn = !!user;

  const handleLogout = () => {
    // 1) marca logout intencional dentro de logout()
    // 2) limpia sesión
    logout();
    // 3) navega luego de limpiar (sin <Link to="/login">)
    navigate("/login", { replace: true });
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold hover:text-yellow-300">
        SkillNet
      </Link>

      {/* Links */}
      <div className="flex gap-6 items-center text-lg">
        <Link
          to="/mis-turnos"
          className={`hover:text-yellow-300 ${
            isActive("/mis-turnos") ? "underline font-semibold" : ""
          }`}
        >
          Mis Turnos
        </Link>

        <Link
          to="/solicitar"
          className={`hover:text-yellow-300 ${
            isActive("/solicitar") ? "underline font-semibold" : ""
          }`}
        >
          Solicitar Turno
        </Link>

        <Link
          to="/suscripciones"
          className={`hover:text-yellow-300 ${
            isActive("/suscripciones") ? "underline font-semibold" : ""
          }`}
        >
          Suscripciones
        </Link>

        {!isLoggedIn ? (
          <>
            <Link to="/login" className="hover:text-yellow-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-yellow-300">
              Register
            </Link>
          </>
        ) : (
          <>
            {/* Perfil como ícono */}
            <Link
              to="/perfil"
              className={`text-2xl hover:text-yellow-300 ${
                isActive("/perfil") ? "text-yellow-300" : ""
              }`}
              title="Perfil"
            >
              <FaUserCircle />
            </Link>

            {/* Salir */}
            <button
              onClick={handleLogout}
              className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-4 py-2 rounded-full font-semibold"
            >
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
