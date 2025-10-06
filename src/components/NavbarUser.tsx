import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

function NavbarUser() {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}

        <Link to="/" className="text-2xl font-bold cursor-pointer hover:text-yellow-300">
          Skillnet
        </Link>

<div className="flex items-center space-x-6">
        {/* Links */}
        <div className="hidden md:flex space-x-6">
          <a href="/turnos" className="hover:text-yellow-300 transition text-lg">
            Mis Turnos
          </a>
          <a href="/solicitar" className="hover:text-yellow-300 transition text-lg">
            Solicitar Turno
          </a>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-base font-semibold bg-yellow-400 text-blue-900 hover:text-white transition"
        >
          <FaSignOutAlt className="text-xl" />
          Salir
        </button>

        {/* Perfil */}
        <div>
          <a href="/perfil">
            <FaUserCircle className="text-3xl text-gray-700 hover:text-blue-600" />
          </a>
        </div>
      </div>
      </div>
    </nav>
  );
}

export default NavbarUser