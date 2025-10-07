import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

function NavbarProvider() {

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

        <div className="flex items-center gap-6 md:gap-8">
          {/* Links */}
          <div className="hidden md:flex space-x-6">
            <a href="/agenda" className="hover:text-yellow-300 transition text-lg">
              Mi Agenda
            </a>
          </div>


          <div className="flex items-center space-x-6">

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-base font-semibold bg-yellow-400 text-blue-900 hover:text-white transition"
            >
              <FaSignOutAlt className="text-xl" />
              Salir
            </button>

            {/* Ícono de Perfil */}
            <Link to="/perfil">
              <FaUserCircle className="text-3xl text-white hover:text-yellow-400 transition" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavbarProvider;