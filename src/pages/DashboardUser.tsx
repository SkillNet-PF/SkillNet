"use client";

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
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { uploadAvatar, updateUserProfile } from "../services/auth";
import { useRef, useState } from "react";

function UserProfile() {
  const { user, setUser } = useAuthContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Estados para edición inline
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    name: "",
    email: "",
    birthDate: "",
    address: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Subir foto de perfil
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona una imagen válida.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen debe pesar menos de 5MB.");
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadAvatar(file);
      if (user) {
        setUser({
          ...user,
          imgProfile: result.imgProfile,
        });
      }
      alert("¡Imagen de perfil actualizada correctamente!");
    } catch (error: any) {
      alert(`Error subiendo la imagen: ${error.message || "Error desconocido"}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Manejar edición inline
  const startEditing = (field: string) => {
    setEditingField(field);
    setTempValues({
      name: user?.name || "",
      email: user?.email || "",
      birthDate: user?.birthDate || "",
      address: (user as any)?.address || "",
      phone: (user as any)?.phone || "",
    });
  };

  const cancelEditing = () => {
    setEditingField(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveChanges = async () => {
    if (!editingField || !user?.userId) return;
    setIsSaving(true);
    try {
      const updates = {
        [editingField]: tempValues[editingField as keyof typeof tempValues],
      };
      const updatedUser = await updateUserProfile(user.userId, updates);
      setUser({
        ...user,
        [editingField]: updatedUser[editingField],
      });
      setEditingField(null);
      alert("¡Campo actualizado correctamente!");
    } catch (error: any) {
      alert(`Error al actualizar: ${error.message || "Error desconocido"}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 min-h-screen profile-page bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-200 mb-8 border-b-4 border-yellow-400 pb-2">
        Perfil de Usuario
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Historial */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 dark:text-blue-100 mb-4 border-b pb-2 flex items-center space-x-2">
              <FaClipboardList className="text-yellow-500" />
              <span>Historial de Solicitudes</span>
            </h3>
            <div className="space-y-4">
              {!user || !(user as any).requests || (user as any).requests?.length === 0 ? (
                <div className="text-center py-8">
                  <FaClipboardList className="mx-auto text-6xl text-gray-300 dark:text-slate-600 mb-4" />
                  <p className="text-gray-500 dark:text-slate-400 text-lg">
                    No tienes solicitudes de servicios aún
                  </p>
                  <p className="text-gray-400 dark:text-slate-500 text-sm mt-2">
                    ¡Explora nuestros proveedores y solicita tu primer servicio!
                  </p>
                </div>
              ) : (
                (user as any).requests.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  >
                    <div>
                      <p className="font-semibold text-lg text-blue-900 dark:text-blue-200">
                        {req.service}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Fecha: {req.date}
                      </p>
                    </div>
                    <Link
                      to={`/request/${req.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                    >
                      Ver Detalles →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="lg:col-span-1 space-y-8">
          {/* Imagen */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-lg text-center">
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
                title={isUploading ? "Subiendo imagen..." : "Cambiar foto"}
              >
                <FaCamera className="text-sm" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {isUploading && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                Subiendo imagen...
              </p>
            )}
          </div>

          {/* Datos de cuenta con edición inline */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 dark:text-blue-100 mb-4 border-b pb-2">
              Mis Datos de Cuenta
            </h3>

            {["name", "email", "birthDate", "address", "phone"].map((field) => (
              <div className="mb-4" key={field}>
                <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                  {field === "name" && <FaUser />}
                  {field === "email" && <FaEnvelope />}
                  {field === "birthDate" && <FaBirthdayCake />}
                  {field === "address" && <FaMapMarkerAlt />}
                  {field === "phone" && <FaPhone />}
                  <span>
                    {{
                      name: "Nombre Completo",
                      email: "Correo Electrónico",
                      birthDate: "Fecha de Nacimiento",
                      address: "Dirección",
                      phone: "Teléfono",
                    }[field]}
                  </span>
                </h4>

                {editingField === field ? (
                  <div className="space-y-2">
                    <input
                      type={field === "birthDate" ? "date" : "text"}
                      value={tempValues[field as keyof typeof tempValues]}
                      onChange={(e) =>
                        handleInputChange(field, e.target.value)
                      }
                      className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={saveChanges}
                        disabled={isSaving}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-1 disabled:bg-gray-400"
                      >
                        <FaSave />
                        <span>{isSaving ? "Guardando..." : "Guardar"}</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={isSaving}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center space-x-1 disabled:bg-gray-400"
                      >
                        <FaTimes />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border">
                    <p className="text-gray-700 dark:text-slate-200">
                      {field === "birthDate" && user?.birthDate
                        ? formatDate(user.birthDate)
                        : (user as any)?.[field] || "No especificado"}
                    </p>
                    <button
                      onClick={() => startEditing(field)}
                      className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Estado de cuenta */}
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
                <p>{user?.isActive ? "Activa" : "Inactiva"}</p>
              </div>
            </div>

            {/* Rol */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaUser />
                <span>Tipo de Cuenta</span>
              </h4>
              <p className="bg-gray-50 p-3 rounded-lg border capitalize">
                {user?.rol === "client"
                  ? "Cliente"
                  : user?.rol === "provider"
                  ? "Proveedor"
                  : user?.rol || "No especificado"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
