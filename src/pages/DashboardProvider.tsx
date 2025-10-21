import React, { useState, useRef, useEffect, useMemo, ElementType } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { updateProviderProfile, uploadAvatar } from "../services/auth";
import { getCategories, CategoryDto } from "../services/categories";
import { FaEdit, FaEnvelope, FaUser, FaCamera, FaMapMarkerAlt, FaPhone, FaBirthdayCake, FaCheckCircle, FaSave, FaTimes, FaCog, FaInfoCircle, FaClipboardList, FaClock } from "react-icons/fa";


// --- 1. DEFINICIÓN DE INTERFACES PARA CORREGIR ERRORES DE TIPADO (TS7031) ---

// Tipo para el icono (cualquier componente de React Icon)
type IconType = ElementType; 
// O si solo se usan los iconos de Fa:
// type IconType = typeof FaUser; 



// Interface para EditableField
interface EditableFieldProps {
    icon: IconType;
    title: string;
    field: string;
    currentValue: any; // Mantenemos 'any' para el valor crudo del perfil
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
    displayValue?: string; // Es opcional
}


// Componente auxiliar para el diseño de tarjetas de datos clave (similares a la imagen)
// Aplicamos la interface StatCardProps

// Componente para manejar la visualización/edición de un campo
// Aplicamos la interface EditableFieldProps
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
  const isDaysOrHorarios = field === 'days' || field === 'horarios';

  // Usar useMemo para evitar re-renderizados innecesarios del campo de edición
  const editInput = useMemo(() => {
    // Nota: El tipo 'keyof typeof tempValues' se maneja mejor en el componente principal,
    // pero aquí lo tipamos con un acceso genérico.
    const tempValue = tempValues[field]; 

    if (isTextArea) {
      return (
        <textarea
          value={tempValue}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
          rows={3}
        />
      );
    }
    // Para campos de días/horarios, sugerir formato en el placeholder
    const finalPlaceholder = isDaysOrHorarios 
      ? "Ej: Lunes, Miércoles, Viernes (separar por comas)"
      : placeholder;
    
    return (
      <input
        type={inputType}
        value={tempValue}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={finalPlaceholder}
      />
    );
  }, [field, tempValues, handleInputChange, inputType, isTextArea, placeholder, isDaysOrHorarios]);

  return (
    <div className="mb-4 p-4 border-b border-gray-100 last:border-b-0">
      <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-3 mb-2">
        <Icon className="text-blue-500" />
        <span>{title}</span>
      </h4>
      {isEditing ? (
        <div className="space-y-2 mt-2">
          {editInput}
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


function ProviderProfile() {
// ... (El resto del código de ProviderProfile se mantiene igual, ya que sus tipos internos son correctos)
// ... (La lógica de useAuthContext, normalización del perfil, useEffect y funciones se mantiene igual)

  const { user, setUser, role } = useAuthContext();

  // Normaliza el shape del usuario
  const profile: any =
    (user as any)?.user || (user as any)?.data || user || null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgBust, setImgBust] = useState<number>(0);

  // Estados para edición inline
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<{ [key: string]: any }>({ // Tipado más flexible aquí
    name: profile?.name || "",
    email: profile?.email || "",
    birthDate: profile?.birthDate?.split("T")[0] || "", // Asegura formato YYYY-MM-DD para input type="date"
    address: profile?.address || "",
    phone: profile?.phone || "",
    // serviceType eliminado de la UI; se usa categoría
    about: profile?.about || "",
    days: Array.isArray(profile?.dias)
      ? profile.dias.join(", ")
      : profile?.days || "",
    horarios: Array.isArray(profile?.horarios)
      ? profile.horarios.join(", ")
      : profile?.horarios || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  // Resync cuando profile se hidrata
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
    // Cargar categorías para selector
    getCategories().then(setCategories).catch(() => setCategories([]));
    setCategoryId(profile?.category?.categoryId || profile?.category?.CategoryID || "");
  }, [profile]);

  // Formatear fechas para mostrar
  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificada";
    try {
        // Maneja fechas ya en formato YYYY-MM-DD y ISO strings
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
    } catch (e) {
        return dateString; // En caso de error, muestra el string original
    }
  };

  // Manejar clic en el botón de cámara
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // Manejar selección de archivo
  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // ... (Lógica de subida de imagen)
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
      // Actualizar el usuario en el contexto con la nueva imagen (manteniendo el shape original)
      if (user) {
        const raw: any = user;
        const next = raw?.user
          ? { ...raw, user: { ...raw.user, imgProfile: result.imgProfile } }
          : raw?.data
          ? { ...raw, data: { ...raw.data, imgProfile: result.imgProfile } }
          : { ...raw, imgProfile: result.imgProfile };
        setUser(next);
        setImgBust(Date.now()); // bust cache
      }
      alert("¡Imagen de perfil actualizada correctamente!");
    } catch (error: any) {
      console.error("Error subiendo la imagen:", error);
      alert(
        `Error subiendo la imagen: ${error?.message || "Error desconocido"}`
      );
    } finally {
      setIsUploading(false);
      // Limpiar el input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Iniciar edición de un campo
  const startEditing = (field: string) => {
    setEditingField(field);
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate || "",
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
  };

  // Cancelar edición
  const cancelEditing = () => {
    setEditingField(null);
    // Resetea todos los tempValues a los valores del perfil
    setTempValues({
      name: profile?.name || "",
      email: profile?.email || "",
      birthDate: profile?.birthDate || "",
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
  };

  // Guardar cambios
  const saveChanges = async () => {
    if (!editingField || !profile?.userId) return;
    if (tempValues[editingField as keyof typeof tempValues] === (profile[editingField] || profile.dias || profile.horarios)) {
        // No hay cambios
        setEditingField(null);
        return;
    }

    setIsSaving(true);
    const fieldToUpdate = editingField; // Capturar el campo a actualizar

    try {
      // Preparar los datos para enviar al API
      const updates: Record<string, any> = {
        [fieldToUpdate]: tempValues[fieldToUpdate],
      };

      // Normaliza a arreglo si tu API lo espera como array (dias/horarios)
      // Nota: El backend de tu app probablemente espera 'dias'/'horarios' y no 'days'/'horarios'
      if (fieldToUpdate === "days") {
        const parsed = updates.days
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        updates.dias = parsed; // Usar el nombre de campo que parece usar el backend (dias)
        delete updates.days;
      }
      if (fieldToUpdate === "horarios") {
        const parsed = updates.horarios
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        updates.horarios = parsed;
      }

      // Hacer la llamada al API para actualizar el proveedor
      await updateProviderProfile(profile.userId, updates);

      // Actualizar el contexto local respetando el shape original
      const raw: any = user;
      const keyToUpdate = fieldToUpdate === "days" ? "dias" : fieldToUpdate; // Usar 'dias' si el campo editado fue 'days'

      const updatedFields = { [keyToUpdate]: updates[keyToUpdate] || updates[fieldToUpdate] };


      const next = raw?.user
        ? { ...raw, user: { ...raw.user, ...updatedFields } }
        : raw?.data
        ? { ...raw, data: { ...raw.data, ...updatedFields } }
        : { ...raw, ...updatedFields };

      setUser(next);
      
      setEditingField(null);
      alert("¡Campo actualizado correctamente!");
    } catch (error: any) {
      console.error("Error al actualizar el campo:", error);
      alert(
        `Error al actualizar el campo: ${error?.message || "Error desconocido"}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Manejar cambio en input de edición
  const handleInputChange = (field: string, value: string) => {
    setTempValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!profile)
    return (
      <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
        <p>Cargando perfil…</p>
      </div>
    );

  // Determinar si es proveedor para aplicar el diseño distintivo
  const isProvider = role === "provider";

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-slate-900 dark:text-slate-100 min-h-screen">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8 border-b-4 border-yellow-400 pb-2">
        Perfil de Proveedor
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Historial/Actividad */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 flex items-center space-x-3">
            <FaClipboardList className="text-yellow-500" />
            <span>Panel de Actividad</span>
          </h2>

                {/* 2. ACERCA DE MÍ (con edición) */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-2 border-b pb-2">
                        <FaInfoCircle className="text-yellow-500" />
                        <span>Información de Servicio</span>
                    </h2>
                </div>

        {/* Columna derecha: Perfil del usuario */}
        <div className="space-y-6">
          {/* Sección 1: Foto de Perfil */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
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
                onClick={handleCameraClick}
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
            <h3 className="text-xl font-bold text-blue-900 mt-3">{profile?.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{profile.email} - Rol: {role}</p>
          </div>

          {/* Sección 2: Datos de Cuenta */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">
              Mis Datos de Cuenta
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

            {/* Tipo de servicio eliminado: se muestra categoría */}
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
                      <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                    ))}
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await updateProviderProfile(profile.userId, { categoryId });
                          const raw: any = user;
                          const next = raw?.user
                            ? { ...raw, user: { ...raw.user, category: { categoryId, name: categories.find(c=>c.categoryId===categoryId)?.name || '' } } }
                            : raw?.data
                            ? { ...raw, data: { ...raw.data, category: { categoryId, name: categories.find(c=>c.categoryId===categoryId)?.name || '' } } }
                            : { ...raw, category: { categoryId, name: categories.find(c=>c.categoryId===categoryId)?.name || '' } };
                          setUser(next);
                          setEditingField(null);
                          alert("¡Categoría actualizada!");
                        } catch (e:any) {
                          alert(e?.message || "Error actualizando categoría");
                        } finally {
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

            {/* Acerca de mí */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaInfoCircle />
                <span>Acerca de mí</span>
              </h4>
              {editingField === "about" ? (
                <div className="space-y-2">
                  <textarea
                    value={tempValues.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cuéntanos sobre tu experiencia y servicios..."
                    rows={3}
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
                <div className="flex justify-between items-start bg-gray-50 p-3 rounded-lg border">
                  <p className="text-gray-700 flex-1">
                    {profile?.about || "No especificado"}
                  </p>
                  <button
                    onClick={() => startEditing("about")}
                    className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50 ml-2"
                    title="Editar descripción"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Días de atención */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaClipboardList />
                <span>Días de atención</span>
              </h4>
              {editingField === "days" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempValues.days}
                    onChange={(e) => handleInputChange("days", e.target.value)}
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Lunes, Miércoles, Viernes"
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
                    {Array.isArray(profile?.dias)
                      ? profile.dias.join(", ")
                      : profile?.days || "No especificados"}
                  </p>
                  <button
                    onClick={() => startEditing("days")}
                    className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                    title="Editar días"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </div>

            {/* Horarios */}
            <div className="mb-4">
              <h4 className="text-lg font-medium text-blue-900 flex items-center space-x-2 mb-2">
                <FaClock />
                <span>Horarios</span>
              </h4>
              {editingField === "horarios" ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempValues.horarios}
                    onChange={(e) =>
                      handleInputChange("horarios", e.target.value)
                    }
                    className="w-full p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 09:00 - 18:00"
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
                    {Array.isArray(profile?.horarios)
                      ? profile.horarios.join(", ")
                      : profile?.horarios || "No especificados"}
                  </p>
                  <button
                    onClick={() => startEditing("horarios")}
                    className="text-blue-600 hover:text-blue-800 transition p-1 rounded-full hover:bg-blue-50"
                    title="Editar horarios"
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
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
                    profile?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <p className="text-gray-700">
                  {profile?.isActive ? "Activa" : "Inactiva"}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* FOOTER - Solo para clientes o cualquier rol que no sea proveedor en el layout principal */}
      {!isProvider && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center space-x-2">
                  <FaClipboardList className="text-yellow-500" />
                  <span>Actividad Reciente (Placeholder)</span>
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 text-center border">
                  <div className="text-5xl text-gray-300 mb-3">📅</div>
                  <p className="text-gray-500">
                      Aquí aparecerán tus citas y el historial de servicios como cliente.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
}

export default ProviderProfile;