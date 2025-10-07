import { FaUserCircle } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";

function NavbarVisitor() {
    const [open, setOpen] = useState(false);

    return (

        <nav className="bg-blue-900 text-white shadow-lg">
            <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
                <div className="flex items-center gap-2">
                    <Link
                        to="/"
                        className="text-2xl font-bold hover:text-yellow-300 transition"
                    >
                        SkillNet
                    </Link>
                </div>

                <div className="flex items-center gap-6 md:gap-8">
                    <Link to="/login" className="hover:text-yellow-300 transition text-lg">
                        Login
                    </Link>

                    {/* Dropdown Register */}
                    <div className="relative">
                        <button
                            onClick={() => setOpen(!open)}
                            className="px-4 py-2 bg-yellow-400 text-blue-900 font-semibold rounded-lg shadow-md hover:bg-yellow-300 transition duration-300 ease-in-out text-lg"
                        >
                            Register
                        </button>


                        {open && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-blue-100 rounded-xl shadow-lg overflow-hidden animate-fadeIn z-10">
                                <Link
                                    to="/register/user"
                                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                >
                                    Como Usuario
                                </Link>
                                <Link
                                    to="/register/provider"
                                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                                >
                                    Como Proveedor
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Perfil */}
                    <Link
                        to="/profile"
                        className="text-3xl hover:text-yellow-300 transition drop-shadow-sm" // Aumento el tamaño del ícono a text-3xl
                    >
                        <FaUserCircle />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default NavbarVisitor;