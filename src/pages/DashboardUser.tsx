import {
  FaEdit,
  FaEnvelope,
  FaUser,
  FaCamera,
  FaClipboardList,
  FaMapMarkerAlt,
  FaPhone,
  FaBirthdayCake,
  FaCheckCircle,
  FaCreditCard,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { uploadAvatar } from "../services/auth";
import { useRef, useState } from "react";

function UserProfile() {
  const { user, setUser } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Formatear fechas para mostrar
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Manejar clic en el botón de cámara
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Manejar selección de archivo
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido.");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(
        "El archivo es demasiado grande. Por favor selecciona una imagen menor a 5MB."
      );
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAvatar(file);
      // Actualizar el usuario en el contexto con la nueva imagen
      if (user) {
        setUser({
          ...user,
          imgProfile: result.imgProfile,
        });
      }
      alert("¡Imagen de perfil actualizada correctamente!");
    } catch (error: any) {
      alert(
        `Error subiendo la imagen: ${error.message || "Error desconocido"}`
      );
    } finally {
      setIsUploading(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
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
              <FaClipboardList className="text-yellow-500" />
              <span>Historial de Solicitudes</span>
            </h3>
            <div className="space-y-4">
              {/* Mostrar mensaje cuando no hay solicitudes */}
              {!user ||
              !(user as any).requests ||
              (user as any).requests?.length === 0 ? (
                <div className="text-center py-8">
                  <FaClipboardList className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">
                    No tienes solicitudes de servicios aún
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    ¡Explora nuestros proveedores y solicita tu primer servicio!
                  </p>
                </div>
              ) : (
                (user as any).requests.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold text-lg text-blue-900">
                          {req.service}
                        </p>
                        <p className="text-sm text-gray-500">
                          Fecha de solicitud: {req.date}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/request/${req.id}`}
                      className="text-blue-600 hover:underline font-medium text-sm"
                    >
                      Ver Detalles &rarr;
                    </Link>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-right">
              <Link
                to="/requests"
                className="text-blue-600 hover:underline font-medium"
              >
                Ver todo el historial &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* ➡️ LADO DERECHO (1/3): Datos de Cuenta y Foto */}
        <div className="lg:col-span-1 space-y-8">
          {/* Sección 1: Foto de Perfil */}
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={
                  user?.imgProfile ||
                  "https://via.placeholder.com/150/0000FF/FFFFFF?text=U"
                }
                alt="Foto de Perfil"
                className="w-full h-full rounded-full object-cover border-4 border-blue-600"
              />
              <button
                onClick={handleCameraClick}
                disabled={isUploading}
                className={`absolute bottom-0 right-0 p-2 rounded-full text-blue-900 transition shadow-md border-2 border-white ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-300 cursor-pointer"
                }`}
                title={
                  isUploading ? "Subiendo imagen..." : "Cambiar foto de perfil"
                }
              >
                <FaCamera className="text-sm" />
              </button>
            </div>

            {/* Input file oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading && (
              <p className="text-sm text-blue-600 mb-2">Subiendo imagen...</p>
            )}

            <button
              onClick={handleCameraClick}
              disabled={isUploading}
              className={`text-sm hover:underline mt-1 block ${
                isUploading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 cursor-pointer"
              }`}
            >
              {isUploading ? "Subiendo..." : "Cambiar Foto de Perfil"}
            </button>
          </div>

          {/* Sección 2: Datos de Cuenta */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">
              Mis Datos de Cuenta
            </h3>

            {/* Nombre */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaUser />
                <span>Nombre Completo</span>
              </h4>
              <p className="bg-gray-50 p-3 rounded-lg border text-gray-700 font-medium">
                {user?.name || "No especificado"}
              </p>
            </div>

            {/* Correo Electrónico */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaEnvelope />
                <span>Correo Electrónico</span>
              </h4>
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                <p className="text-gray-700 truncate">
                  {user?.email || "No especificado"}
                </p>
                <button className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50">
                  <FaEdit />
                </button>
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaBirthdayCake />
                <span>Fecha de Nacimiento</span>
              </h4>
              <p className="bg-gray-50 p-3 rounded-lg border text-gray-700">
                {user?.birthDate
                  ? formatDate(user.birthDate)
                  : "No especificada"}
              </p>
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaMapMarkerAlt />
                <span>Dirección</span>
              </h4>
              <p className="bg-gray-50 p-3 rounded-lg border text-gray-700">
                {(user as any)?.address || "No especificada"}
              </p>
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaPhone />
                <span>Teléfono</span>
              </h4>
              <p className="bg-gray-50 p-3 rounded-lg border text-gray-700">
                {(user as any)?.phone || "No especificado"}
              </p>
            </div>

            {/* Estado de la Cuenta */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaCheckCircle />
                <span>Estado de la Cuenta</span>
              </h4>
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border">
                <span
                  className={`w-3 h-3 rounded-full ${
                    user?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <p className="text-gray-700">
                  {user?.isActive ? "Activa" : "Inactiva"}
                </p>
              </div>
            </div>

            {/* Servicios Disponibles */}
            {(user as any)?.servicesLeft !== undefined && (
              <div className="mb-4">
                <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                  <FaCreditCard />
                  <span>Servicios Disponibles</span>
                </h4>
                <p className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-700 font-semibold">
                  {(user as any).servicesLeft} servicios restantes
                </p>
              </div>
            )}

            {/* Fechas de Suscripción */}
            {(user as any)?.startDate && (user as any)?.endDate && (
              <div className="mb-4">
                <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                  <FaCalendarAlt />
                  <span>Suscripción</span>
                </h4>
                <div className="bg-gray-50 p-3 rounded-lg border space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Inicio:</span>{" "}
                    {formatDate((user as any).startDate)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Vencimiento:</span>{" "}
                    {formatDate((user as any).endDate)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        (user as any).paymentStatus
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    <p className="text-gray-700">
                      Pago:{" "}
                      {(user as any).paymentStatus ? "Al día" : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rol del Usuario */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaUser />
                <span>Tipo de Cuenta</span>
              </h4>
              <p className="bg-gray-50 p-3 rounded-lg border text-gray-700 capitalize">
                {user?.rol === "client"
                  ? "Cliente"
                  : user?.rol === "provider"
                  ? "Proveedor"
                  : user?.rol || "No especificado"}
              </p>
            </div>

            {/* Botón de Editar Perfil */}
            <div className="pt-4 border-t">
              <Link
                to="/profile/edit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center space-x-2"
              >
                <FaEdit />
                <span>Editar Perfil</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
