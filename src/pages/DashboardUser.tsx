"use client";

import React, { useRef, useState, useEffect } from "react";
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

// SWEETALERT2 helpers
import {
  showLoading,
  closeLoading,
  alertSuccess,
  alertError,
} from "../ui/alerts";

function UserProfile() {
  const { user, setUser, role } = useAuthContext();

  // Normaliza el shape del usuario por si viene como { user }, { data } o directo
  const profile: any =
    (user as any)?.user || (user as any)?.data || user || null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgBust, setImgBust] = useState<number>(0);

  // --- edición inline ---
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    birthDate: profile?.birthDate || "",
    address: profile?.address || "",
    phone: profile?.phone || "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Validadores simples
  const isNonEmpty = (v: string) => v.trim().length > 0;
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v: string) => /^\+?\d{7,15}$/.test(v.trim());
  const isValidDate = (v: string) => {
    if (!v) return false;
    const d = new Date(v);
    return !Number.isNaN(d.getTime()) && d <= new Date();
  };

  // Re-sincroniza tempValues cuando se hidrata/cambia el profile
  useEffect(() => {
    if (!profile) return;
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
    });
  }, [profile]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleCameraClick = () => fileInputRef.current?.click();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validaciones con SweetAlert2
    if (!file.type.startsWith("image/")) {
      return alertError(
        "Archivo inválido",
        "Selecciona una imagen (PNG/JPG/WEBP)."
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      return alertError(
        "Archivo muy grande",
        "La imagen debe ser menor a 5 MB."
      );
    }

    setIsUploading(true);
    try {
      showLoading("Subiendo imagen...");
      // tu servicio actual devuelve { imgProfile }
      const result = await uploadAvatar(file);

      if (user) {
        // Conserva el shape original del contexto
        const raw: any = user;
        const next = raw?.user
          ? { ...raw, user: { ...raw.user, imgProfile: result.imgProfile } }
          : raw?.data
          ? { ...raw, data: { ...raw.data, imgProfile: result.imgProfile } }
          : { ...raw, imgProfile: result.imgProfile };

        setUser(next);
        setImgBust(Date.now()); // fuerza que el <img> no use caché
      }
      await alertSuccess(
        "¡Imagen actualizada!",
        "Tu foto de perfil se guardó correctamente."
      );
    } catch (error: any) {
      await alertError(
        "No se pudo subir la imagen",
        error?.message || "Inténtalo más tarde."
      );
    } finally {
      closeLoading();
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startEditing = (field: string) => {
    setEditingField(field);
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
    });
  };

  const cancelEditing = () => {
    setEditingField(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!editingField || !profile?.userId) return;

    // Validaciones por campo antes de guardar
    const value = tempValues[editingField as keyof typeof tempValues] as string;

    if (editingField === "name" && !isNonEmpty(value)) {
      return alertError("Validación", "El nombre no puede estar vacío.");
    }
    if (editingField === "email" && !isValidEmail(value)) {
      return alertError("Validación", "Ingresa un correo electrónico válido.");
    }
    if (editingField === "phone" && !isValidPhone(value)) {
      return alertError(
        "Validación",
        "El teléfono debe tener 7 a 15 dígitos (puede incluir +)."
      );
    }
    if (editingField === "birthDate" && !isValidDate(value)) {
      return alertError(
        "Validación",
        "Selecciona una fecha válida (no futura)."
      );
    }
    if (editingField === "address" && !isNonEmpty(value)) {
      return alertError("Validación", "La dirección no puede estar vacía.");
    }

    setIsSaving(true);
    try {
      showLoading("Guardando cambios...");
      const updates = { [editingField]: value };

      await updateUserProfile(profile.userId, updates);

      // Mantén el shape original del contexto al actualizar
      const raw: any = user;
      const next = raw?.user
        ? { ...raw, user: { ...raw.user, ...updates } }
        : raw?.data
        ? { ...raw, data: { ...raw.data, ...updates } }
        : { ...raw, ...updates };

      setUser(next);
      setEditingField(null);
      await alertSuccess("¡Listo!", "Campo actualizado correctamente.");
    } catch (e: any) {
      await alertError(
        "No se pudo actualizar",
        e?.message || "Inténtalo más tarde."
      );
    } finally {
      closeLoading();
      setIsSaving(false);
    }
  };

  // Fallback mientras hidrata el contexto
  if (!profile) {
    return (
      <div className="container mx-auto p-6 min-h-screen">
        <p>Cargando perfil…</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 min-h-screen profile-page bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-200 mb-8 border-b-4 border-yellow-400 pb-2 dark:border-yellow-400">
        {role === "provider" ? "Perfil de proveedor" : "Perfil de cliente"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* IZQUIERDA: historial */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 dark:text-blue-100 mb-4 border-b pb-2 dark:border-slate-700 flex items-center space-x-2">
              <FaClipboardList className="text-yellow-500" />
              <span>Historial de Solicitudes</span>
            </h3>

            <div className="space-y-4">
              {!profile ||
              !profile.requests ||
              profile.requests?.length === 0 ? (
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
                profile.requests.map((req: any) => (
                  <div
                    key={req.id}
                    className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700 transition"
                  >
                    <div>
                      <p className="font-semibold text-lg text-blue-900 dark:text-blue-200">
                        {req.service}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Fecha de solicitud: {req.date}
                      </p>
                    </div>
                    <Link
                      to={`/request/${req.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
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
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Ver todo el historial &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* DERECHA: foto + datos */}
        <div className="lg:col-span-1 space-y-8">
          {/* Foto de perfil */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-lg text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={
                  ((profile?.imgProfile || profile?.picture) ??
                    "https://via.placeholder.com/150/0000FF/FFFFFF?text=U") +
                  (imgBust ? `?v=${imgBust}` : "")
                }
                alt="Foto de Perfil"
                className="w-full h-full rounded-full object-cover border-4 border-blue-600"
              />
              <button
                onClick={handleCameraClick}
                disabled={isUploading}
                className={`absolute bottom-0 right-0 p-2 rounded-full text-blue-900 dark:text-slate-900 transition shadow-md border-2 border-white ${
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

            {/* input file oculto */}
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

          {/* Datos de cuenta */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 dark:text-blue-100 mb-4 border-b pb-2 dark:border-slate-700">
              Mis Datos de Cuenta
            </h3>

            {/* Nombre */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaUser />
                <span>Nombre Completo</span>
              </h4>

              {editingField === "name" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempValues.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu nombre completo"
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
                <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  <p className="text-gray-700 dark:text-slate-200 font-medium">
                    {profile?.name || "No especificado"}
                  </p>
                  <button
                    onClick={() => startEditing("name")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700"
                    title="Editar nombre"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaEnvelope />
                <span>Correo Electrónico</span>
              </h4>

              {editingField === "email" ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={tempValues.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu correo electrónico"
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
                <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                  <p className="text-gray-700 dark:text-slate-200 truncate">
                    {profile?.email || "No especificado"}
                  </p>
                  <button
                    onClick={() => startEditing("email")}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50 dark:hover:bg-slate-700"
                    title="Editar correo"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Fecha de nacimiento */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaBirthdayCake />
                <span>Fecha de Nacimiento</span>
              </h4>

              {editingField === "birthDate" ? (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={tempValues.birthDate}
                    onChange={(e) =>
                      handleInputChange("birthDate", e.target.value)
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
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-700">
                    {profile?.birthDate
                      ? formatDate(profile.birthDate)
                      : "No especificada"}
                  </p>
                  <button
                    onClick={() => startEditing("birthDate")}
                    className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                    title="Editar fecha de nacimiento"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Dirección */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaMapMarkerAlt />
                <span>Dirección</span>
              </h4>

              {editingField === "address" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempValues.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu dirección"
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
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-700">
                    {profile?.address || "No especificada"}
                  </p>
                  <button
                    onClick={() => startEditing("address")}
                    className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                    title="Editar dirección"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Teléfono */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaPhone />
                <span>Teléfono</span>
              </h4>

              {editingField === "phone" ? (
                <div className="space-y-2">
                  <input
                    type="tel"
                    value={tempValues.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu teléfono"
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
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-700">
                    {profile?.phone || "No especificado"}
                  </p>
                  <button
                    onClick={() => startEditing("phone")}
                    className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                    title="Editar teléfono"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Estado de la Cuenta */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaCheckCircle />
                <span>Estado de la Cuenta</span>
              </h4>
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                <span
                  className={`w-3 h-3 rounded-full ${
                    profile?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <p className="text-gray-700 dark:text-slate-200">
                  {profile?.isActive ? "Activa" : "Inactiva"}
                </p>
              </div>
            </div>

            {/* Servicios disponibles */}
            {profile?.servicesLeft !== undefined && (
              <div className="mb-4">
                <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                  <FaCreditCard />
                  <span>Servicios Disponibles</span>
                </h4>
                <p className="bg-blue-50 dark:bg-slate-800 p-3 rounded-lg border border-blue-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-semibold">
                  {profile.servicesLeft} servicios restantes
                </p>
              </div>
            )}

            {/* Suscripción */}
            {profile?.startDate && profile?.endDate && (
              <div className="mb-4">
                <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                  <FaCalendarAlt />
                  <span>Suscripción</span>
                </h4>
                <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 space-y-2">
                  <p className="text-gray-700 dark:text-slate-200">
                    <span className="font-medium">Inicio:</span>{" "}
                    {formatDate(profile.startDate)}
                  </p>
                  <p className="text-gray-700 dark:text-slate-200">
                    <span className="font-medium">Vencimiento:</span>{" "}
                    {formatDate(profile.endDate)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        profile.paymentStatus ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <p className="text-gray-700 dark:text-slate-200">
                      Pago: {profile.paymentStatus ? "Al día" : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rol */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 dark:text-blue-200 flex items-center space-x-2 mb-2">
                <FaUser />
                <span>Tipo de Cuenta</span>
              </h4>
              <p className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 capitalize">
                {profile?.rol === "client"
                  ? "Cliente"
                  : profile?.rol === "provider"
                  ? "Proveedor"
                  : profile?.rol || "No especificado"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
