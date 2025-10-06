import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center">
            <h1 className="text-7xl font-extrabold text-blue-600 mb-3">404</h1>
            <p className="text-gray-700 text-lg mb-6">La página que buscas no existe o fue movida.</p>
            <Link
                to="/"
                className="px-5 py-2 bg-blue-600 text-white rounded-full shadow hover:bg-blue-700 transition-colors"
            >
                Volver al inicio
            </Link>
        </div>
    )
}

export default NotFound;