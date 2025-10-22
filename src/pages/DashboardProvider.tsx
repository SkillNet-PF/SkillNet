import React, { useState, useRef, useEffect, ElementType } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { updateProviderProfile, uploadAvatar } from "../services/auth";
import { getCategories, CategoryDto } from "../services/categories";
import {
  FaEdit,
  FaEnvelope,
  FaUser,
  FaCamera,
  FaMapMarkerAlt,
  FaPhone,
  FaBirthdayCake,
  FaCheckCircle,
  FaSave,
  FaTimes,
  FaCog,
  FaInfoCircle,
  FaClipboardList,
  FaClock,
  FaStar,
} from "react-icons/fa";
import {
  showLoading,
  closeLoading,
  alertSuccess,
  alertError,
} from "../ui/alerts";

/* --------------------- Estilo y utilidades --------------------- */
type IconType = ElementType;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
}) => (
  <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500 flex items-center justify-between transition hover:shadow-xl">
    <div>
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
    </div>
    <Icon className={`text-4xl ${color} opacity-30`} />
  </div>
);

interface EditableFieldProps {
  icon: IconType;
  title: string;
  field: string;
  currentValue: any;
  editingField: string | null;
  tempValues: { [key: string]: any };
  startEditing: (field: string) => void;
  handleInputChange: (field: string, value: string) => void;
  saveChanges: () => Promise<void>;
  cancelEditing: () => void;
  isSaving: boolean;
  inputType?: string;
  isTextArea?: boolean;
  placeholder?: string;
  displayValue?: string;
}

/** EditableField sin memo: evita que desaparezca el input al editar */
const EditableField: React.FC<EditableFieldProps> = ({
  icon: Icon,
  title,
  field,
  currentValue,
  editingField,
  tempValues,
  startEditing,
  handleInputChange,
  saveChanges,
  cancelEditing,
  isSaving,
  inputType = "text",
  isTextArea = false,
  placeholder = "",
  displayValue,
}) => {
  const isEditing = editingField === field;
  const value = String(tempValues[field] ?? "");
  const ph =
    field === "days" || field === "horarios"
      ? "Ej: Lunes, Miércoles, Viernes (separar por comas)"
      : placeholder;

  return (
    <div className="mb-4 p-4 border-b border-gray-100 last:border-b-0">
      <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-3 mb-2">
        <Icon className="text-blue-500" />
        <span>{title}</span>
      </h4>

      {isEditing ? (
        <div className="space-y-2 mt-2">
          {isTextArea ? (
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={ph}
              rows={3}
            />
          ) : (
            <input
              type={inputType}
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={ph}
            />
          )}

          <div className="flex space-x-2">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-1 disabled:bg-gray-400 text-sm"
            >
              <FaSave />
              <span>{isSaving ? "Guardando..." : "Guardar"}</span>
            </button>
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center space-x-1 disabled:bg-gray-400 text-sm"
            >
              <FaTimes />
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[44px]">
          <p className="text-gray-700 font-normal flex-1 break-words whitespace-pre-wrap">
            {displayValue || currentValue || "No especificado"}
          </p>
          <button
            onClick={() => startEditing(field)}
            className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-100 ml-2 self-center"
            title={`Editar ${title.toLowerCase()}`}
          >
            <FaEdit className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
};

/* --------------------- Componente principal --------------------- */
function DashboardProvider() {
  const { user, setUser, role } = useAuthContext();

  // Normaliza el shape del usuario
  const profile: any =
    (user as any)?.user || (user as any)?.data || user || null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgBust, setImgBust] = useState<number>(0);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: any }>({});
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  useEffect(() => {
    if (!profile) return;
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate?.split("T")[0] || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
      // serviceType eliminado de la UI
      about: profile?.about || "",
      days: Array.isArray(profile?.dias)
        ? profile.dias.join(", ")
        : profile?.days || "",
      horarios: Array.isArray(profile?.horarios)
        ? profile.horarios.join(", ")
        : profile?.horarios || "",
    });
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    setCategoryId(
      profile?.category?.categoryId || profile?.category?.CategoryID || ""
    );
  }, [profile]);

  // Validaciones
  const isNonEmpty = (v: string) => v.trim().length > 0;
  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isValidPhone = (v: string) => /^\+?\d{7,15}$/.test(v.trim());
  const isValidDate = (v: string) => {
    if (!v) return false;
    const d = new Date(v);
    return !Number.isNaN(d.getTime()) && d <= new Date();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificada";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Avatar
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      await alertError(
        "Archivo inválido",
        "Selecciona una imagen (PNG/JPG/WEBP)."
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      await alertError("Archivo muy grande", "Debe ser menor a 5 MB.");
      return;
    }

    setIsUploading(true);
    try {
      showLoading("Subiendo imagen...");
      const result = await uploadAvatar(file);

      const raw: any = user;
      const next = raw?.user
        ? { ...raw, user: { ...raw.user, imgProfile: result.imgProfile } }
        : raw?.data
        ? { ...raw, data: { ...raw.data, imgProfile: result.imgProfile } }
        : { ...raw, imgProfile: result.imgProfile };

      setUser(next);
      setImgBust(Date.now());
      await alertSuccess(
        "¡Imagen actualizada!",
        "Tu foto de perfil se guardó correctamente."
      );
    } catch (error: any) {
      await alertError(
        "Error",
        error?.message || "No se pudo subir la imagen."
      );
    } finally {
      closeLoading();
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handlers edición
  const handleInputChange = (field: string, value: string) =>
    setTempValues((prev) => ({ ...prev, [field]: value }));

  const startEditing = (field: string) => {
    setEditingField(field);
    // refresca valores por si el perfil cambió
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate?.split("T")[0] || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
      about: profile?.about || "",
      days: Array.isArray(profile?.dias)
        ? profile.dias.join(", ")
        : profile?.days || "",
      horarios: Array.isArray(profile?.horarios)
        ? profile.horarios.join(", ")
        : profile?.horarios || "",
    });
  };

  const cancelEditing = () => {
    setEditingField(null);
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate?.split("T")[0] || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
      about: profile?.about || "",
      days: Array.isArray(profile?.dias)
        ? profile.dias.join(", ")
        : profile?.days || "",
      horarios: Array.isArray(profile?.horarios)
        ? profile.horarios.join(", ")
        : profile?.horarios || "",
    });
  };

  const saveChanges = async (): Promise<void> => {
    if (!editingField || !profile?.userId) return;

    const value = String(tempValues[editingField] ?? "").trim();

    // Validaciones rápidas
    if (editingField === "name" && !isNonEmpty(value)) {
      await alertError("Validación", "El nombre no puede estar vacío.");
      return;
    }
    if (editingField === "email" && !isValidEmail(value)) {
      await alertError("Validación", "Ingresa un correo electrónico válido.");
      return;
    }
    if (editingField === "phone" && !isValidPhone(value)) {
      await alertError(
        "Validación",
        "El teléfono debe tener 7 a 15 dígitos (puede incluir +)."
      );
      return;
    }
    if (editingField === "birthDate" && !isValidDate(value)) {
      await alertError(
        "Validación",
        "Selecciona una fecha válida (no futura)."
      );
      return;
    }
    if (editingField === "about" && (!isNonEmpty(value) || value.length < 10)) {
      await alertError(
        "Validación",
        "Describe tu servicio (mínimo 10 caracteres)."
      );
      return;
    }
    if (editingField === "days" && !isNonEmpty(value)) {
      await alertError(
        "Validación",
        "Indica los días disponibles (ej: lunes, miércoles)."
      );
      return;
    }
    if (editingField === "horarios" && !isNonEmpty(value)) {
      await alertError("Validación", "Indica horarios (ej: 09:00,18:00).");
      return;
    }

    // Construir payload
    const updates: Record<string, any> = {};
    if (editingField === "days") {
      updates.dias = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (editingField === "horarios") {
      updates.horarios = value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else {
      updates[editingField] = value;
    }

    setIsSaving(true);
    try {
      showLoading("Guardando cambios...");
      await updateProviderProfile(profile.userId, updates);

      // Actualizar contexto respetando shape
      const raw: any = user;
      const key = editingField === "days" ? "dias" : editingField; // 'horarios' ya coincide
      const next = raw?.user
        ? { ...raw, user: { ...raw.user, [key]: updates[key] ?? value } }
        : raw?.data
        ? { ...raw, data: { ...raw.data, [key]: updates[key] ?? value } }
        : { ...raw, [key]: updates[key] ?? value };

      setUser(next);
      setEditingField(null);
      await alertSuccess("¡Listo!", "Campo actualizado correctamente.");
    } catch (error: any) {
      await alertError("Error", error?.message || "No se pudo actualizar.");
    } finally {
      closeLoading();
      setIsSaving(false);
    }
  };

  if (!profile)
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <p>Cargando perfil…</p>
      </div>
    );

  const isProvider = role === "provider";

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div
        className={`py-4 px-6 mb-8 rounded-xl shadow-lg ${
          isProvider ? "bg-blue-900 text-white" : "bg-white text-gray-800"
        }`}
      >
        <h1 className="text-3xl font-extrabold flex items-center space-x-3">
          <FaUser />
          <span>
            {isProvider ? "  Perfil de Proveedor" : "Perfil de Cliente"}
          </span>
        </h1>
        {isProvider && (
          <p className="text-blue-200 mt-1">
            Gestión y visibilidad de tu cuenta de servicios.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUMNA IZQUIERDA — estadísticas e info de servicio */}
        {isProvider && (
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Valoración promedio"
                value={`${profile.rating || "4.5"}/5`}
                icon={FaStar}
                color="text-yellow-600"
              />
              <StatCard
                title="Servicios Activos"
                value={profile.activeServices || "4"}
                icon={FaCog}
                color="text-green-600"
              />
              <StatCard
                title="Citas Próximas"
                value={profile.pendingAppointments || "12"}
                icon={FaClock}
                color="text-red-600"
              />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-2 border-b pb-2">
                <FaInfoCircle className="text-yellow-500" />
                <span>Información de Servicio</span>
              </h2>

              {/* Categoría (remoto) */}
              <div className="mb-4">
                <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                  <FaCog />
                  <span>Categoría</span>
                </h4>
                {editingField === "category" ? (
                  <div className="space-y-2">
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((c) => (
                        <option key={c.categoryId} value={c.categoryId}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          if (!categoryId) return;
                          setIsSaving(true);
                          try {
                            showLoading("Guardando categoría...");
                            await updateProviderProfile(profile.userId, {
                              categoryId,
                            });
                            const raw: any = user;
                            const catName =
                              categories.find(
                                (c) => c.categoryId === categoryId
                              )?.name || "";
                            const next = raw?.user
                              ? {
                                  ...raw,
                                  user: {
                                    ...raw.user,
                                    category: { categoryId, name: catName },
                                  },
                                }
                              : raw?.data
                              ? {
                                  ...raw,
                                  data: {
                                    ...raw.data,
                                    category: { categoryId, name: catName },
                                  },
                                }
                              : {
                                  ...raw,
                                  category: { categoryId, name: catName },
                                };
                            setUser(next);
                            setEditingField(null);
                            await alertSuccess(
                              "¡Categoría actualizada!",
                              "Se guardó correctamente."
                            );
                          } catch (e: any) {
                            await alertError(
                              "Error",
                              e?.message || "Error actualizando categoría"
                            );
                          } finally {
                            closeLoading();
                            setIsSaving(false);
                          }
                        }}
                        disabled={isSaving || !categoryId}
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
                      {profile?.category?.name || "Sin categoría"}
                    </p>
                    <button
                      onClick={() => setEditingField("category")}
                      className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                      title="Editar categoría"
                    >
                      <FaEdit />
                    </button>
                  </div>
                )}
              </div>

              {/* About / días / horarios con EditableField */}
              <EditableField
                icon={FaInfoCircle}
                title="Acerca de mí (Descripción)"
                field="about"
                currentValue={profile?.about}
                editingField={editingField}
                tempValues={tempValues}
                startEditing={startEditing}
                handleInputChange={handleInputChange}
                saveChanges={saveChanges}
                cancelEditing={cancelEditing}
                isSaving={isSaving}
                isTextArea
                placeholder="Cuéntanos sobre tu experiencia y especialidades."
              />

              <EditableField
                icon={FaClipboardList}
                title="Días de atención"
                field="days"
                currentValue={
                  Array.isArray(profile?.dias)
                    ? profile.dias.join(", ")
                    : profile?.days
                }
                editingField={editingField}
                tempValues={tempValues}
                startEditing={startEditing}
                handleInputChange={handleInputChange}
                saveChanges={saveChanges}
                cancelEditing={cancelEditing}
                isSaving={isSaving}
                placeholder="Ej: Lunes, Miércoles, Viernes"
              />

              <EditableField
                icon={FaClock}
                title="Horarios"
                field="horarios"
                currentValue={
                  Array.isArray(profile?.horarios)
                    ? profile.horarios.join(", ")
                    : profile?.horarios
                }
                editingField={editingField}
                tempValues={tempValues}
                startEditing={startEditing}
                handleInputChange={handleInputChange}
                saveChanges={saveChanges}
                cancelEditing={cancelEditing}
                isSaving={isSaving}
                placeholder="Ej: 09:00, 14:00, 18:00"
              />
            </div>
          </div>
        )}

        {/* COLUMNA DERECHA — avatar + datos personales */}
        <div className={isProvider ? "space-y-6" : "lg:col-span-3 space-y-6"}>
          {/* Avatar */}
          <div className="bg-white p-6 rounded-xl shadow-lg text-center border-t-4 border-yellow-400">
            <div className="relative w-36 h-36 mx-auto mb-4">
              <img
                src={
                  ((profile?.imgProfile || profile?.picture) ??
                    "https://via.placeholder.com/150/0000FF/FFFFFF?text=P") +
                  (imgBust ? `?v=${imgBust}` : "")
                }
                alt="Foto de Perfil"
                className="w-full h-full rounded-full object-cover border-4 border-blue-600 shadow-xl"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`absolute bottom-0 right-0 p-3 rounded-full text-blue-900 transition shadow-lg border-2 border-white ${
                  isUploading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-yellow-400 hover:bg-yellow-300 cursor-pointer"
                }`}
                title={
                  isUploading ? "Subiendo imagen..." : "Cambiar foto de perfil"
                }
              >
                <FaCamera className="text-md" />
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
              <p className="text-sm text-blue-600 mt-2">Subiendo imagen...</p>
            )}
            <h3 className="text-xl font-bold text-blue-900 mt-3">
              {profile?.name}
            </h3>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>

          {/* Datos Personales y Contacto */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 mb-2 flex items-center space-x-2 border-b pb-2">
              <FaUser className="text-yellow-500" />
              <span>Datos Personales y Contacto</span>
            </h3>

            <EditableField
              icon={FaUser}
              title="Nombre Completo"
              field="name"
              currentValue={profile?.name}
              editingField={editingField}
              tempValues={tempValues}
              startEditing={startEditing}
              handleInputChange={handleInputChange}
              saveChanges={saveChanges}
              cancelEditing={cancelEditing}
              isSaving={isSaving}
              placeholder="Ingresa tu nombre completo"
            />

            <EditableField
              icon={FaEnvelope}
              title="Correo Electrónico"
              field="email"
              currentValue={profile?.email}
              editingField={editingField}
              tempValues={tempValues}
              startEditing={startEditing}
              handleInputChange={handleInputChange}
              saveChanges={saveChanges}
              cancelEditing={cancelEditing}
              isSaving={isSaving}
              inputType="email"
              placeholder="Ingresa tu correo electrónico"
            />

            <EditableField
              icon={FaPhone}
              title="Teléfono"
              field="phone"
              currentValue={profile?.phone}
              editingField={editingField}
              tempValues={tempValues}
              startEditing={startEditing}
              handleInputChange={handleInputChange}
              saveChanges={saveChanges}
              cancelEditing={cancelEditing}
              isSaving={isSaving}
              inputType="tel"
              placeholder="Ingresa tu teléfono"
            />

            <EditableField
              icon={FaMapMarkerAlt}
              title="Dirección"
              field="address"
              currentValue={profile?.address}
              editingField={editingField}
              tempValues={tempValues}
              startEditing={startEditing}
              handleInputChange={handleInputChange}
              saveChanges={saveChanges}
              cancelEditing={cancelEditing}
              isSaving={isSaving}
              placeholder="Ingresa tu dirección"
            />

            <EditableField
              icon={FaBirthdayCake}
              title="Fecha de Nacimiento"
              field="birthDate"
              currentValue={profile?.birthDate}
              displayValue={formatDate(profile?.birthDate)}
              editingField={editingField}
              tempValues={tempValues}
              startEditing={startEditing}
              handleInputChange={handleInputChange}
              saveChanges={saveChanges}
              cancelEditing={cancelEditing}
              isSaving={isSaving}
              inputType="date"
            />

            {/* Estado de la Cuenta (solo visualización) */}
            <div className="p-4 border-b border-gray-100 last:border-b-0">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-3 mb-2">
                <FaCheckCircle className="text-blue-500" />
                <span>Estado de la Cuenta</span>
              </h4>
              <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span
                  className={`w-3 h-3 rounded-full ${
                    profile?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                  title={
                    profile?.isActive ? "Cuenta Activa" : "Cuenta Inactiva"
                  }
                />
                <p className="text-gray-700 font-medium">
                  {profile?.isActive
                    ? "Activa"
                    : "Inactiva/Pendiente de Validación"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer para clientes */}
      {!isProvider && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
            <FaClipboardList className="text-yellow-500" />
            <span>Actividad Reciente (Placeholder)</span>
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 text-center border">
            <div className="text-5xl text-gray-300 mb-3">📅</div>
            <p className="text-gray-500">
              Aquí aparecerán tus citas y el historial de servicios como
              cliente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardProvider;
