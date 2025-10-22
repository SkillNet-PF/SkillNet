import { FaUserCircle } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const { pathname } = useLocation();
  const isActive = (path: string) => pathname.startsWith(path);

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

        {/* 🔹 Nuevo: Suscripciones */}
        <Link
          to="/suscripciones"
          className={`hover:text-yellow-300 ${
            isActive("/suscripciones") ? "underline font-semibold" : ""
          }`}
        >
          Suscripciones
        </Link>

        {/* Login / Register visibles si no hay sesión */}
        <Link to="/login" className="hover:text-yellow-300">
          Login
        </Link>
        <Link to="/register" className="hover:text-yellow-300">
          Register
        </Link>

        {/* Perfil como ícono */}
        <Link
          to="/profile"
          className={`text-2xl hover:text-yellow-300 ${
            isActive("/profile") ? "text-yellow-300" : ""
          }`}
        >
          <FaUserCircle />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
