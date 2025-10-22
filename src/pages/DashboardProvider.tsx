import { useEffect, useState } from "react";
import {
  FaEdit,
  FaEnvelope,
  FaUser,
  FaCamera,
  FaCheckCircle,
  FaSave,
  FaTimes,
  FaCog,
  FaInfoCircle,
  FaStar,
  FaClock,
} from "react-icons/fa";
import { getDashboardProvider, updateProvider } from "../services/providers";
import { ServiceProvider } from "../services/providers";

/* ====== Campo editable ====== */
const EditableField = ({
  icon: Icon,
  label,
  field,
  currentValue,
  editingField,
  tempValues,
  setTempValues,
  setEditingField,
  saveChanges,
  isSaving,
}: {
  icon: any;
  label: string;
  field: string;
  currentValue?: string;
  editingField: string | null;
  tempValues: Record<string, any>;
  setTempValues: (v: any) => void;
  setEditingField: (v: string | null) => void;
  saveChanges: () => void;
  isSaving: boolean;
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3 border border-gray-100">
      <div className="flex items-center mb-2 text-gray-700 font-semibold">
        <Icon className="mr-2 text-blue-600" />
        {label}
      </div>

      {editingField === field ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <input
            type="text"
            value={tempValues[field] || ""}
            onChange={(e) =>
              setTempValues({ ...tempValues, [field]: e.target.value })
            }
            className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
          />
          <div className="flex gap-2">
            <button
              onClick={saveChanges}
              disabled={isSaving}
              className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center gap-1"
            >
              <FaSave />
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="bg-gray-300 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-1"
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center text-gray-600">
          <span>{currentValue || "No especificado"}</span>
          <button
            onClick={() => setEditingField(field)}
            className="text-blue-500 hover:text-blue-600"
          >
            <FaEdit />
          </button>
        </div>
      )}
    </div>
  );
};

/* ====== Componente principal ====== */
export default function DashboardProvider() {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardProvider();
        setProvider(data);
        setTempValues({
          name: data.name || "",
          email: data.email || "",
          birthDate: data.birthDate?.split("T")[0] || "",
          address: data.address || "",
          phone: data.phone || "",
          category: data.category?.name || "",
          about: data.about || "",
          dias: Array.isArray(data.dias) ? data.dias.join(", ") : "",
          horarios: Array.isArray(data.horarios)
            ? data.horarios.join(", ")
            : data.horarios || "",
        });
      } catch (err) {
        console.error("Error al cargar el perfil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const saveChanges = async () => {
    if (!editingField || !provider?.userId) return;
    setIsSaving(true);

    try {
      const updates: Record<string, any> = {
        [editingField]: tempValues[editingField],
      };

      if (editingField === "dias") {
        updates.dias = tempValues.dias
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
      if (editingField === "horarios") {
        updates.horarios = tempValues.horarios
          ?.split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
      }

      const updated = await updateProvider(provider.userId, updates);
      setProvider({ ...provider, ...updated });
      setEditingField(null);
      alert("✅ Cambios guardados correctamente");
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("❌ No se pudo guardar el cambio.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Cargando...</p>;

  if (!provider)
    return (
      <p className="text-center mt-10 text-red-500">No se encontró el perfil.</p>
    );

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 p-8 rounded-2xl mt-6">
      {/* HEADER */}
      <div className="bg-blue-900 text-white p-5 rounded-t-xl shadow-md mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaUser className="text-yellow-300" />
          Perfil de Proveedor
        </h1>
        <p className="text-sm opacity-90">
          Gestión y visibilidad de tu cuenta de servicios.
        </p>
      </div>

      {/* TARJETAS DE RESUMEN (usando datos del backend) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-yellow-400 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">VALORACIÓN PROMEDIO</span>
          <span className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
            4.5/5 <FaStar />
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-green-500 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">CITAS CONFIRMADAS</span>
          <span className="text-3xl font-bold text-green-600">
            {provider.confirmedAppointments ?? 0}
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-red-500 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">CITAS PENDIENTES</span>
          <span className="text-3xl font-bold text-red-600 flex items-center gap-2">
            {provider.pendingAppointments ?? 0} <FaClock />
          </span>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LADO DERECHO - Avatar y datos personales */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center border border-gray-100">
            <div className="relative mb-3">
              <img
                src={provider.imgProfile || "https://via.placeholder.com/150"}
                alt="Foto de perfil"
                className="w-28 h-28 rounded-full border-4 border-yellow-400"
              />
              <button className="absolute bottom-1 right-1 bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-500">
                <FaCamera />
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              {provider.name}
            </h2>
            <p className="text-gray-500 text-sm">{provider.email}</p>
            <p className="text-gray-400 text-xs mt-1">
              Rol: <span className="font-semibold">Provider</span>
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
              <FaUser /> Datos Personales y Contacto
            </h3>

            <EditableField
              icon={FaUser}
              label="Nombre Completo"
              field="name"
              currentValue={provider.name}
              editingField={editingField}
              tempValues={tempValues}
              setTempValues={setTempValues}
              setEditingField={setEditingField}
              saveChanges={saveChanges}
              isSaving={isSaving}
            />

            <EditableField
              icon={FaEnvelope}
              label="Correo Electrónico"
              field="email"
              currentValue={provider.email}
              editingField={editingField}
              tempValues={tempValues}
              setTempValues={setTempValues}
              setEditingField={setEditingField}
              saveChanges={saveChanges}
              isSaving={isSaving}
            />
          </div>
        </div>

        {/* LADO IZQUIERDO - Información de servicio */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
            <FaInfoCircle /> Información de Servicio
          </h3>

          <EditableField
            icon={FaCog}
            label="Tipo de Servicio"
            field="category"
            currentValue={provider.category?.name}
            editingField={editingField}
            tempValues={tempValues}
            setTempValues={setTempValues}
            setEditingField={setEditingField}
            saveChanges={saveChanges}
            isSaving={isSaving}
          />

          <EditableField
            icon={FaInfoCircle}
            label="Acerca de mí (Descripción)"
            field="about"
            currentValue={provider.about}
            editingField={editingField}
            tempValues={tempValues}
            setTempValues={setTempValues}
            setEditingField={setEditingField}
            saveChanges={saveChanges}
            isSaving={isSaving}
          />

          <EditableField
            icon={FaCheckCircle}
            label="Días de atención"
            field="dias"
            currentValue={
              Array.isArray(provider.dias)
                ? provider.dias.join(", ")
                : provider.dias || ""
            }
            editingField={editingField}
            tempValues={tempValues}
            setTempValues={setTempValues}
            setEditingField={setEditingField}
            saveChanges={saveChanges}
            isSaving={isSaving}
          />

          <EditableField
            icon={FaCog}
            label="Horarios"
            field="horarios"
            currentValue={
              Array.isArray(provider.horarios)
                ? provider.horarios.join(", ")
                : provider.horarios || ""
            }
            editingField={editingField}
            tempValues={tempValues}
            setTempValues={setTempValues}
            setEditingField={setEditingField}
            saveChanges={saveChanges}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
