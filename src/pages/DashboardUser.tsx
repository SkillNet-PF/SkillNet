import { FaEdit, FaEnvelope, FaUser, FaCamera, FaClipboardList } from "react-icons/fa";
import { Link } from "react-router-dom";

function UserProfile() {
    // Datos simulados (Simplificados: eliminamos el 'status')
    const userData = {
        name: 'Ana',
        lastName: 'Gómez',
        email: 'ana.gomez@mail.com',
        profilePicture: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=AG',
        requests: [
            { id: 1, service: 'Plomería de emergencia', date: '2025-09-15' },
            { id: 2, service: 'Instalación eléctrica', date: '2025-10-01' },
            { id: 3, service: 'Mantenimiento de jardín', date: '2025-10-05' },
        ],
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-extrabold text-blue-900 mb-8 border-b-4 border-yellow-400 pb-2">
             Perfil de Usuario
            </h1>

            {/* Layout Principal: Dos Columnas (Historial 2/3 | Datos 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ⬅️ LADO IZQUIERDO (2/3): Servicios Solicitados (Historial simple) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2 flex items-center space-x-2">
                            <FaClipboardList className='text-yellow-500' />
                            <span>Historial de Solicitudes</span>
                        </h3>
                        <div className="space-y-4">
                            {userData.requests.map(req => (
                                <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition">
                                    <div className='flex items-center space-x-3'>
                                        {/* Eliminamos el ícono de estado aquí */}
                                        <div>
                                            <p className="font-semibold text-lg text-blue-900">{req.service}</p>
                                            <p className="text-sm text-gray-500">Fecha de solicitud: {req.date}</p>
                                        </div>
                                    </div>
                                    {/* Eliminamos el badge de estado aquí */}
                                    <Link to={`/request/${req.id}`} className="text-blue-600 hover:underline font-medium text-sm">
                                        Ver Detalles &rarr;
                                    </Link>
                                </div>
                            ))}
                        </div>
                        <div className='mt-4 text-right'>
                            <Link to="/requests" className="text-blue-600 hover:underline font-medium">
                                Ver todo el historial &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ➡️ LADO DERECHO (1/3): Datos de Cuenta y Foto (Sin cambios) */}
                <div className="lg:col-span-1 space-y-8">
                    
                    {/* Sección 1: Foto de Perfil */}
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        <div className="relative w-28 h-28 mx-auto mb-4">
                            <img
                                src={userData.profilePicture}
                                alt="Foto de Perfil"
                                className="w-full h-full rounded-full object-cover border-4 border-blue-600"
                            />
                            <button className="absolute bottom-0 right-0 bg-yellow-400 p-2 rounded-full text-blue-900 hover:bg-yellow-300 transition shadow-md border-2 border-white">
                                <FaCamera className="text-sm" />
                            </button>
                        </div>
                        <Link to="/profile/picture-edit" className="text-sm text-blue-600 hover:underline mt-1 block">
                            Ver/Editar Foto
                        </Link>
                    </div>

                    {/* Sección 2: Datos de Cuenta */}
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <h3 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">
                            Mis Datos de Cuenta
                        </h3>
                        
                        {/* Nombre y Apellido (Ver) */}
                        <div className="mb-6 space-y-3">
                            <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-1">
                                <FaUser />
                                <span>Nombre y Apellido</span>
                            </h4>
                            <p className="bg-gray-50 p-3 rounded-lg border text-gray-700 font-medium">
                                {userData.name} {userData.lastName}
                            </p>
                        </div>

                        {/* Correo Electrónico (Ver y Editar) */}
                        <div className="border-t pt-4">
                            <h4 className="text-lg font-medium text-blue-900 mb-2 flex items-center space-x-2">
                                <FaEnvelope />
                                <span>Correo Electrónico</span>
                            </h4>
                            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                                <p className="text-gray-700 truncate">{userData.email}</p>
                                <button className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50">
                                    <FaEdit /> 
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile
