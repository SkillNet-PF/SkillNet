"use client";

import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaCamera,
  FaClipboardList,
  FaCheckCircle,
  FaCreditCard,
  FaCalendarAlt,
  FaUser,
  FaEnvelope,
  FaBirthdayCake,
  FaMapMarkerAlt,
  FaPhone,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { useAuthContext } from "../contexts/AuthContext";
import { uploadAvatar, updateUserProfile } from "../services/auth";
import {
  showLoading,
  closeLoading,
  alertSuccess,
  alertError,
} from "../ui/alerts";

// ================== helpers ==================
const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/** Normaliza URL de avatar:
 * - Si es relativa, la prefixea con el backend
 * - Si la URL ya trae query, usa &v=; si no, usa ?v=
 * - Si no hay imagen, usa placeholder
 */
function buildAvatarUrl(raw?: string | null, bust?: number) {
  const placeholder = "https://via.placeholder.com/150/0a58ca/FFFFFF?text=U";
  if (!raw) return placeholder;

  let url = /^https?:\/\//i.test(raw)
    ? raw
    : `${API_BASE.replace(/\/$/, "")}/${String(raw).replace(/^\//, "")}`;

  if (bust) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}v=${bust}`;
  }
  return url;
}

function DashboardUser() {
  const { user, setUser, role } = useAuthContext();
  const navigate = useNavigate();

  const profile: any =
    (user as any)?.user || (user as any)?.data || user || null;

  // ---- estado de UI ----
  const [active, setActive] = useState<number>(0); // 0 Resumen, 1 Datos, 2 Historial
  const tabs = ["Resumen", "Datos", "Historial"];

  // avatar
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgBust, setImgBust] = useState<number>(0);

  // edición inline
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [tempValues, setTempValues] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    birthDate: profile?.birthDate || "",
    address: profile?.address || "",
    phone: profile?.phone || "",
  });

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

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // ======== LÓGICA DE SUSCRIPCIÓN ========
  const now = new Date();
  const endDate = profile?.endDate ? new Date(profile.endDate) : null;
  const subscription = profile?.subscription || profile?.suscription || null;

  // Consideramos "plan pagado" sólo si:
  // - paymentStatus true
  // - existe nombre de plan
  // - existen fechas válidas
  const hasPaidPlan =
    Boolean(profile?.paymentStatus) &&
    Boolean(subscription?.name || subscription?.Name) &&
    Boolean(profile?.startDate) &&
    Boolean(profile?.endDate);

  const isSubscriptionActive = !!hasPaidPlan && !!endDate && endDate > now;

  const planName = hasPaidPlan
    ? subscription?.name || subscription?.Name
    : "Sin plan";

  const servicesLeft = isSubscriptionActive
    ? Number(profile?.servicesLeft ?? 0)
    : 0;

  // Si no hay plan activo, intercepta el intento de crear cita
  const handleRequestClick = (e: React.MouseEvent) => {
    if (!isSubscriptionActive) {
      e.preventDefault();
      alertError(
        "Suscripción requerida",
        "Elige un plan y completa el pago para poder solicitar turnos."
      ).then(() => navigate("/suscripciones"));
    }
  };

  const handleCameraClick = () => fileInputRef.current?.click();
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return alertError("Archivo inválido", "Selecciona una imagen.");
    if (file.size > 5 * 1024 * 1024)
      return alertError("Archivo muy grande", "Máx. 5 MB.");
    setIsUploading(true);
    try {
      showLoading("Subiendo imagen...");
      const result = await uploadAvatar(file);
      if (user) {
        const raw: any = user;
        const next = raw?.user
          ? { ...raw, user: { ...raw.user, imgProfile: result.imgProfile } }
          : raw?.data
          ? { ...raw, data: { ...raw.data, imgProfile: result.imgProfile } }
          : { ...raw, imgProfile: result.imgProfile };
        setUser(next);
        setImgBust(Date.now()); // cache-buster
      }
      await alertSuccess("¡Imagen actualizada!", "Se guardó correctamente.");
    } catch (err: any) {
      await alertError(
        "No se pudo subir",
        err?.message || "Inténtalo más tarde."
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
  const cancelEditing = () => setEditingField(null);
  const handleInputChange = (f: string, v: string) =>
    setTempValues((prev) => ({ ...prev, [f]: v }));

  const saveChanges = async () => {
    if (!editingField || !profile?.userId) return;
    setIsSaving(true);
    try {
      showLoading("Guardando cambios...");
      const updates = { [editingField]: (tempValues as any)[editingField] };
      await updateUserProfile(profile.userId, updates);
      const raw: any = user;
      const next = raw?.user
        ? { ...raw, user: { ...raw.user, ...updates } }
        : raw?.data
        ? { ...raw, data: { ...raw.data, ...updates } }
        : { ...raw, ...updates };
      setUser(next);
      setEditingField(null);
      await alertSuccess("¡Listo!", "Campo actualizado.");
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

  if (!profile) return <div className="container mx-auto p-6">Cargando…</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <img
                  src={buildAvatarUrl(
                    profile?.imgProfile || profile?.picture,
                    imgBust
                  )}
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <button
                  onClick={handleCameraClick}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 bg-yellow-400 text-blue-900 p-2 rounded-full border-2 border-white shadow"
                  title={isUploading ? "Subiendo..." : "Cambiar foto"}
                >
                  <FaCamera />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold">
                  {role === "provider"
                    ? "Perfil de proveedor"
                    : "Perfil de cliente"}
                </h1>
                <p className="opacity-90">{profile?.name || "Usuario"}</p>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex gap-2">
              <Link
                to={isSubscriptionActive ? "/solicitar" : "#"}
                onClick={handleRequestClick}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur border border-white/20"
              >
                Solicitar turno
              </Link>
              <Link
                to="/suscripciones"
                className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-4 py-2 rounded-lg font-semibold"
              >
                Ver planes
              </Link>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-sm opacity-90">Servicios restantes</div>
              <div className="text-2xl font-bold">{servicesLeft}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-sm opacity-90">Plan</div>
              <div className="text-2xl font-bold">{planName}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <div className="text-sm opacity-90">Estado</div>
              <div className="text-2xl font-bold">
                {isSubscriptionActive ? "Activa" : "No activa"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="container mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 h-max">
          {/* Suscripción */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-5">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <FaCalendarAlt /> Mi suscripción
            </h3>

            {!hasPaidPlan ? (
              <>
                <p className="text-sm opacity-80">
                  Aún no tienes una suscripción activa. Elige un plan para poder
                  solicitar turnos.
                </p>
                <div className="flex gap-2 mt-4">
                  <Link
                    to="/suscripciones"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded-lg"
                  >
                    Elegir plan
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Plan:</span> {planName}
                  </div>
                  <div>
                    <span className="font-medium">Inicio:</span>{" "}
                    {profile?.startDate ? formatDate(profile.startDate) : "—"}
                  </div>
                  <div>
                    <span className="font-medium">Vence:</span>{" "}
                    {profile?.endDate ? formatDate(profile.endDate) : "—"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSubscriptionActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    {isSubscriptionActive ? "Al día" : "Pendiente"}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    to="/suscripciones"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center px-3 py-2 rounded-lg"
                  >
                    Cambiar plan
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Estado de cuenta */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow p-5">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
              <FaCheckCircle /> Estado de la cuenta
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  profile?.isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {profile?.isActive ? "Activa" : "Inactiva"}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="lg:col-span-8 space-y-6">
          {/* Tabs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow">
            <div className="flex gap-4 border-b dark:border-slate-700 px-5 pt-4">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setActive(i)}
                  className={`px-3 pb-3 -mb-px ${
                    active === i
                      ? "border-b-2 border-blue-600 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-5">
              {active === 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <Card title="Servicios disponibles" icon={<FaCreditCard />}>
                    <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                      {servicesLeft}
                    </div>
                    <p className="text-sm opacity-70">
                      {isSubscriptionActive
                        ? "Se renuevan con tu plan."
                        : "Elige un plan para habilitar tus servicios."}
                    </p>
                  </Card>

                  <Card title="Próximo vencimiento" icon={<FaCalendarAlt />}>
                    <div className="text-lg font-semibold">
                      {isSubscriptionActive && profile?.endDate
                        ? formatDate(profile.endDate)
                        : "—"}
                    </div>
                    <p className="text-sm opacity-70">
                      {isSubscriptionActive
                        ? "Mantén tu plan activo para pedir turnos."
                        : "Aún no tienes un plan activo."}
                    </p>
                  </Card>
                </div>
              )}

              {active === 1 && (
                <div className="grid md:grid-cols-2 gap-4">
                  {renderEditable(
                    "name",
                    "Nombre completo",
                    profile?.name,
                    <FaUser />,
                    tempValues,
                    handleInputChange,
                    startEditing,
                    saveChanges,
                    cancelEditing,
                    editingField,
                    isSaving
                  )}
                  {renderEditable(
                    "email",
                    "Correo electrónico",
                    profile?.email,
                    <FaEnvelope />,
                    tempValues,
                    handleInputChange,
                    startEditing,
                    saveChanges,
                    cancelEditing,
                    editingField,
                    isSaving,
                    "email"
                  )}
                  {renderEditable(
                    "birthDate",
                    "Fecha de nacimiento",
                    profile?.birthDate ? formatDate(profile.birthDate) : "",
                    <FaBirthdayCake />,
                    tempValues,
                    handleInputChange,
                    startEditing,
                    saveChanges,
                    cancelEditing,
                    editingField,
                    isSaving,
                    "date"
                  )}
                  {renderEditable(
                    "address",
                    "Dirección",
                    profile?.address,
                    <FaMapMarkerAlt />,
                    tempValues,
                    handleInputChange,
                    startEditing,
                    saveChanges,
                    cancelEditing,
                    editingField,
                    isSaving
                  )}
                  {renderEditable(
                    "phone",
                    "Teléfono",
                    profile?.phone,
                    <FaPhone />,
                    tempValues,
                    handleInputChange,
                    startEditing,
                    saveChanges,
                    cancelEditing,
                    editingField,
                    isSaving,
                    "tel"
                  )}
                </div>
              )}

              {active === 2 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FaClipboardList /> Historial de solicitudes
                  </h4>
                  {!profile?.requests || profile.requests.length === 0 ? (
                    <div className="text-center py-10 opacity-70">
                      No tienes solicitudes aún.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {profile.requests.map((r: any) => (
                        <div
                          key={r.id}
                          className="p-4 rounded-lg border dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold">{r.service}</div>
                            <div className="text-sm opacity-70">
                              Fecha: {r.date}
                            </div>
                          </div>
                          <Link
                            to={`/request/${r.id}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Ver detalle →
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardUser;

/** ---------- UI helpers ---------- */
function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 border rounded-xl bg-gray-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-blue-600 dark:text-blue-300">{icon}</div>
        <h4 className="font-semibold">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function renderEditable(
  key: string,
  label: string,
  value: string,
  icon: React.ReactNode,
  temp: any,
  onChange: (k: string, v: string) => void,
  start: (k: string) => void,
  save: () => void,
  cancel: () => void,
  editing: string | null,
  saving: boolean,
  type: "text" | "email" | "date" | "tel" = "text"
) {
  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <h5 className="text-sm font-semibold flex items-center gap-2 mb-2">
        <span className="text-blue-600 dark:text-blue-300">{icon}</span>
        {label}
      </h5>

      {editing === key ? (
        <div className="space-y-2">
          <input
            type={type}
            value={(temp as any)[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full p-2 border rounded-lg bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700"
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <FaSave /> {saving ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={cancel}
              disabled={saving}
              className="px-3 py-1.5 rounded-lg bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="opacity-90">{value || "No especificado"}</span>
          <button
            onClick={() => start(key)}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
