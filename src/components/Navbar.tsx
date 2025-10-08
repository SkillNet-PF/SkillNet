import { FaUserCircle } from "react-icons/fa";

function Navbar() {
    return (
        <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            {/* Logo */}
            <div className="text-2xl font-bold">Skillnet</div>
            {/* Links */}
            <div className="flex gap-6 items-center">
                <a href="/login" className="hover:text-yellow-300">Login</a>
                <a href="/register" className="hover:text-yellow-300">Register</a>

                {/* Perfil como ícono */}
                <a href="/profile" className="text-2xl hover:text-yellow-300">
                    <FaUserCircle />
                </a>
            </div>
        </nav>
    );
}

export default Navbar

