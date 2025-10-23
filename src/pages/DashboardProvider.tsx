import React, { useEffect, useRef, useState } from "react";
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
import {
  getDashboardProvider,
  updateProvider,
  ServiceProvider,
} from "../services/providers";
import { uploadAvatar } from "../services/auth";
import { getCategories, CategoryDto } from "../services/categories";

import {
  showLoading,
  closeLoading,
  alertSuccess,
  alertError,
} from "../ui/alerts";

// util
const DAYS = [
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
  "domingo",
];
const toSlots = (start: string, end: string, step = 60): string[] => {
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  const a = toMin(start);
  const b = toMin(end);
  if (isNaN(a) || isNaN(b) || a >= b) return [];
  const out: string[] = [];
  for (let t = a; t <= b; t += step)
    out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  return out;
};

type FieldKey = "name" | "email" | "category" | "bio" | "dias" | "horarios";

function EditableField({
  icon: Icon,
  label,
  field,
  displayValue,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  children,
}: {
  icon: any;
  label: string;
  field: FieldKey;
  displayValue?: string;
  isEditing: boolean;
  onEdit: (f: FieldKey) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-3 border border-gray-100">
      <div className="flex items-center mb-2 text-gray-700 font-semibold">
        <Icon className="mr-2 text-blue-600" />
        {label}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-3">
          {children}
          <div className="flex gap-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 flex items-center gap-1 disabled:opacity-60"
            >
              <FaSave />
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-300 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-1"
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center text-gray-600">
          <span>{displayValue || "No especificado"}</span>
          <button
            onClick={() => onEdit(field)}
            className="text-blue-500 hover:text-blue-600"
            title={`Editar ${label}`}
          >
            <FaEdit />
          </button>
        </div>
      )}
    </div>
  );
}

export default function DashboardProvider() {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [confirmed, setConfirmed] = useState(0);
  const [pending, setPending] = useState(0);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [editing, setEditing] = useState<FieldKey | null>(null);
  const [tmp, setTmp] = useState<Record<string, any>>({
    name: "",
    email: "",
    bio: "",
    categoryId: "",
    _days: new Set<string>(),
    _start: "09:00",
    _end: "18:00",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // load data
  useEffect(() => {
    (async () => {
      try {
        const p = await getDashboardProvider(); // ya mapeado en services/providers.ts
        setProvider(p);
        setConfirmed(p.confirmedAppointments ?? 0);
        setPending(p.pendingAppointments ?? 0);

        setTmp({
          name: p.name ?? "",
          email: p.email ?? "",
          bio: p.bio ?? "",
          categoryId: p.category?.categoryId ?? "",
          _days: new Set(Array.isArray(p.dias) ? p.dias : []),
          _start:
            Array.isArray(p.horarios) && p.horarios.length
              ? p.horarios[0]
              : "09:00",
          _end:
            Array.isArray(p.horarios) && p.horarios.length
              ? p.horarios[p.horarios.length - 1]
              : "18:00",
        });
      } catch (e) {
        console.error(e);
        await alertError("No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const isEditing = (f: FieldKey) => editing === f;
  const startEdit = (f: FieldKey) => setEditing(f);
  const cancelEdit = () => setEditing(null);

  const categoryLabel = provider?.category?.name ?? "";

  const save = async () => {
    if (!editing || !provider?.userId) return;
    setIsSaving(true);

    try {
      const updates: any = {};

      if (editing === "name") updates.name = tmp.name;
      if (editing === "email") updates.email = tmp.email;
      if (editing === "bio") updates.bio = String(tmp.bio ?? "").trim();

      if (editing === "category") {
        if (!tmp.categoryId) {
          await alertError("Categoría", "Selecciona una categoría.");
          setIsSaving(false);
          return;
        }
        updates.categoryId = tmp.categoryId; // ← tu back update usa categoryId
      }

      if (editing === "dias") {
        updates.dias = Array.from(tmp._days as Set<string>);
      }

      if (editing === "horarios") {
        const slots = toSlots(tmp._start, tmp._end, 60);
        if (!slots.length) {
          await alertError(
            "Rango horario inválido",
            "La hora de inicio debe ser menor a la hora de fin."
          );
          setIsSaving(false);
          return;
        }
        updates.horarios = slots;
      }

      showLoading("Guardando cambios...");
      const updated = await updateProvider(provider.userId, updates);

      // reflect local
      setProvider((prev) => {
        if (!prev) return prev;
        const next: ServiceProvider = { ...prev, ...updated };

        if (updates.categoryId) {
          const found = categories.find(
            (c) => c.categoryId === updates.categoryId
          );
          next.category = found
            ? { categoryId: found.categoryId, name: found.name }
            : prev.category;
        }
        if (updates.dias) next.dias = updates.dias;
        if (updates.horarios) next.horarios = updates.horarios;
        if (updates.bio !== undefined) next.bio = updates.bio;
        if (updates.name) next.name = updates.name;
        if (updates.email) next.email = updates.email;

        return next;
      });

      setEditing(null);
      await alertSuccess(
        "Cambios guardados",
        "El campo se actualizó correctamente."
      );
    } catch (err: any) {
      console.error(err);
      await alertError(
        "No se pudo guardar el cambio.",
        err?.userMessage || err?.message
      );
    } finally {
      closeLoading();
      setIsSaving(false);
    }
  };

  // avatar
  const openFile = () => fileRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      showLoading("Subiendo imagen...");
      const r = await uploadAvatar(file);
      const url = r?.imgProfile ?? provider?.imgProfile ?? null;
      setProvider((p) => (p ? { ...p, imgProfile: url ?? p.imgProfile } : p));
      await alertSuccess("Avatar actualizado", "Se guardó correctamente.");
    } catch (err: any) {
      console.error(err);
      await alertError("No se pudo subir el avatar", err?.message);
    } finally {
      closeLoading();
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-500">Cargando...</p>;
  if (!provider)
    return (
      <p className="text-center mt-10 text-red-500">
        No se encontró el perfil.
      </p>
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

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-yellow-400 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">
            VALORACIÓN PROMEDIO
          </span>
          <span className="text-3xl font-bold text-yellow-500 flex items-center gap-2">
            4.5/5 <FaStar />
          </span>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-green-500 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">CITAS CONFIRMADAS</span>
          <span className="text-3xl font-bold text-green-600">{confirmed}</span>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-md border-t-4 border-red-500 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-1">CITAS PENDIENTES</span>
          <span className="text-3xl font-bold text-red-600 flex items-center gap-2">
            {pending} <FaClock />
          </span>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: avatar + datos */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center border border-gray-100">
            <div className="relative mb-3">
              <img
                src={provider.imgProfile || "https://via.placeholder.com/150"}
                alt="Foto de perfil"
                className="w-28 h-28 rounded-full border-4 border-yellow-400 object-cover"
              />
              <button
                onClick={openFile}
                className="absolute bottom-1 right-1 bg-yellow-400 text-white p-2 rounded-full hover:bg-yellow-500"
                title="Cambiar foto"
              >
                <FaCamera />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="hidden"
              />
            </div>
            {isUploading && (
              <p className="text-sm text-blue-600 mt-1">Subiendo imagen...</p>
            )}
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
              displayValue={provider.name}
              isEditing={isEditing("name")}
              onEdit={startEdit}
              onSave={save}
              onCancel={cancelEdit}
              isSaving={isSaving}
            >
              <input
                type="text"
                value={tmp.name}
                onChange={(e) =>
                  setTmp((p) => ({ ...p, name: e.target.value }))
                }
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
              />
            </EditableField>

            <EditableField
              icon={FaEnvelope}
              label="Correo Electrónico"
              field="email"
              displayValue={provider.email}
              isEditing={isEditing("email")}
              onEdit={startEdit}
              onSave={save}
              onCancel={cancelEdit}
              isSaving={isSaving}
            >
              <input
                type="email"
                value={tmp.email}
                onChange={(e) =>
                  setTmp((p) => ({ ...p, email: e.target.value }))
                }
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
              />
            </EditableField>
          </div>
        </div>

        {/* RIGHT: servicio */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h3 className="font-bold text-blue-700 mb-4 flex items-center gap-2">
            <FaInfoCircle /> Información de Servicio
          </h3>

          {/* Categoría */}
          <EditableField
            icon={FaCog}
            label="Tipo de Servicio"
            field="category"
            displayValue={categoryLabel}
            isEditing={isEditing("category")}
            onEdit={(f) => {
              setTmp((p) => ({
                ...p,
                categoryId: provider?.category?.categoryId ?? "",
              }));
              startEdit(f);
            }}
            onSave={save}
            onCancel={cancelEdit}
            isSaving={isSaving}
          >
            <select
              value={tmp.categoryId}
              onChange={(e) =>
                setTmp((p) => ({ ...p, categoryId: e.target.value }))
              }
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </select>
          </EditableField>

          {/* Bio */}
          <EditableField
            icon={FaInfoCircle}
            label="Acerca de mí (Descripción)"
            field="bio"
            displayValue={provider.bio}
            isEditing={isEditing("bio")}
            onEdit={(f) => {
              setTmp((p) => ({ ...p, bio: provider?.bio ?? "" }));
              startEdit(f);
            }}
            onSave={save}
            onCancel={cancelEdit}
            isSaving={isSaving}
          >
            <textarea
              value={tmp.bio}
              onChange={(e) => setTmp((p) => ({ ...p, bio: e.target.value }))}
              className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
              rows={3}
              placeholder="Cuéntanos tu experiencia, especialidades, etc."
            />
          </EditableField>

          {/* Días */}
          <EditableField
            icon={FaCheckCircle}
            label="Días de atención"
            field="dias"
            displayValue={
              Array.isArray(provider.dias) ? provider.dias.join(", ") : ""
            }
            isEditing={isEditing("dias")}
            onEdit={(f) => {
              setTmp((p) => ({
                ...p,
                _days: new Set(
                  Array.isArray(provider?.dias) ? provider.dias : []
                ),
              }));
              startEdit(f);
            }}
            onSave={save}
            onCancel={cancelEdit}
            isSaving={isSaving}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DAYS.map((d) => {
                const checked = (tmp._days as Set<string>).has(d);
                return (
                  <label key={d} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setTmp((p) => {
                          const s = new Set(p._days as Set<string>);
                          if (e.target.checked) s.add(d);
                          else s.delete(d);
                          return { ...p, _days: s };
                        })
                      }
                    />
                    <span className="capitalize">{d}</span>
                  </label>
                );
              })}
            </div>
          </EditableField>

          {/* Horarios */}
          <EditableField
            icon={FaCog}
            label="Horarios"
            field="horarios"
            displayValue={
              Array.isArray(provider.horarios)
                ? provider.horarios.join(", ")
                : ""
            }
            isEditing={isEditing("horarios")}
            onEdit={(f) => {
              const arr = Array.isArray(provider?.horarios)
                ? provider.horarios
                : [];
              setTmp((p) => ({
                ...p,
                _start: arr[0] ?? "09:00",
                _end: arr[arr.length - 1] ?? "18:00",
              }));
              startEdit(f);
            }}
            onSave={save}
            onCancel={cancelEdit}
            isSaving={isSaving}
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Hora inicio</label>
                <input
                  type="time"
                  value={tmp._start}
                  onChange={(e) =>
                    setTmp((p) => ({ ...p, _start: e.target.value }))
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600">Hora fin</label>
                <input
                  type="time"
                  value={tmp._end}
                  onChange={(e) =>
                    setTmp((p) => ({ ...p, _end: e.target.value }))
                  }
                  className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se generarán slots cada 60 min entre esas horas.
            </p>
          </EditableField>
        </div>
      </div>
    </div>
  );
}
