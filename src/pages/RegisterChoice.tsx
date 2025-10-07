import { Link } from "react-router-dom";

function RegisterChoice() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-lg text-center w-full max-w-md">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">
                    Elige tu tipo de cuenta
                </h1>

                <div className="space-y-4">
                    <Link
                        to="/register/user"
                        className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        Soy Usuario
                    </Link>
                    <Link
                        to="/register/provider"
                        className="block w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition"
                    >
                        Soy Proveedor
                    </Link>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterChoice;