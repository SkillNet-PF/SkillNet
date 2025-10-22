// src/pages/CheckoutPage.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaLock,
  FaArrowLeft,
  FaCheckCircle,
  FaCcVisa,
  FaCcMastercard,
  FaRegClock,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";

// ---- Config de planes (mismo mapping que en /suscripciones) ----
type PlanKey = "basic" | "standard" | "premium";
const PLAN_INFO: Record<
  PlanKey,
  {
    title: string;
    price: number;
    services: number;
    perks: string[];
    badge?: string;
  }
> = {
  basic: {
    title: "Básico",
    price: 5000,
    services: 5,
    perks: ["Agendas rápidas", "Soporte básico", "Recordatorios por correo"],
  },
  standard: {
    title: "Standard",
    price: 8000,
    services: 10,
    perks: [
      "Prioridad media",
      "Notificaciones email + push",
      "Cambio de turno flexible",
    ],
    badge: "Más elegido",
  },
  premium: {
    title: "Premium",
    price: 12000,
    services: 15,
    perks: ["Prioridad alta", "Soporte VIP", "Cancelación flexible"],
  },
};

// Cambia a true para llamar a tu backend real (Stripe) en lugar del mock
const USE_BACKEND = false;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // plan desde query param
  const qp = (params.get("plan") || "").toLowerCase() as PlanKey;
  const [selected, setSelected] = useState<PlanKey | null>(qp || null);

  useEffect(() => {
    if (qp && ["basic", "standard", "premium"].includes(qp)) setSelected(qp);
  }, [qp]);

  const plan = selected ? PLAN_INFO[selected] : null;

  // ---- Form state ----
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState(""); // MM/AA
  const [cvc, setCvc] = useState("");
  const [terms, setTerms] = useState(false);

  // Helpers de formato
  const formatCard = (v: string) =>
    v
      .replace(/[^\d]/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExp = (v: string) => {
    const d = v.replace(/[^\d]/g, "").slice(0, 4);
    if (d.length <= 2) return d;
    return `${d.slice(0, 2)}/${d.slice(2)}`;
  };

  // Validaciones simples
  const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const validCard = useMemo(
    () => card.replace(/\s/g, "").length === 16,
    [card]
  );
  const validExp = useMemo(() => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    const [MM, YY] = exp.split("/").map(Number);
    if (MM < 1 || MM > 12) return false;
    const year = 2000 + YY;
    // debe ser posterior al mes actual
    const fecha = new Date(year, MM);
    const hoy = new Date();
    return fecha > hoy;
  }, [exp]);
  const validCvc = useMemo(() => /^\d{3,4}$/.test(cvc), [cvc]);

  const allOk =
    !!plan &&
    name.trim().length > 0 &&
    isEmail(email) &&
    validCard &&
    validExp &&
    validCvc &&
    terms;

  const brandIcon = useMemo(() => {
    const first = card.trim()[0];
    if (first === "4") return <FaCcVisa className="text-2xl" />;
    if (first === "5") return <FaCcMastercard className="text-2xl" />;
    return <FaLock className="text-2xl" />;
  }, [card]);

  const pay = async () => {
    if (!allOk) {
      return Swal.fire(
        "Revisa tus datos",
        "Completa todos los campos correctamente y acepta los términos.",
        "warning"
      );
    }

    if (!USE_BACKEND) {
      // Maqueta: simulamos éxito
      Swal.fire({
        title: "Procesando pago…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      setTimeout(() => {
        Swal.close();
        navigate(`/pago/success?plan=${selected}`);
      }, 900);
      return;
    }

    try {
      Swal.fire({
        title: "Creando checkout…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Llama a tu backend real
      // const userId = "<id-del-usuario-logueado>";
      // const { data } = await api.post("/subscription/checkout", { plan: selected?.toUpperCase(), userId });
      // window.location.href = data.url;

      Swal.close();
      navigate(`/pago/success?plan=${selected}`);
    } catch (err: any) {
      Swal.fire(
        "No se pudo iniciar el pago",
        err?.message || "Intenta nuevamente.",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Top bar contextual */}
      <div className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link
            to="/suscripciones"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600"
          >
            <FaArrowLeft /> Volver a planes
          </Link>
          <div className="flex items-center gap-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <FaShieldAlt /> Pago seguro
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <FaRegClock /> 2 min
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-6">
          Pasarela de pago
        </h1>

        {/* Layout: Izq form + Der resumen */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Col izquierda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjeta “viva” */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-30" />
              <div
                className="relative rounded-2xl p-5 text-white shadow-lg
                bg-gradient-to-br from-blue-800 via-blue-600 to-indigo-700
                dark:from-slate-800 dark:via-slate-700 dark:to-slate-900
                overflow-hidden transition-all duration-300"
              >
                {/* Logo SkillNet (ajusta la ruta si tu logo está en otra carpeta) */}
                <div className="absolute top-5 left-5 flex items-center gap-2 opacity-90">
                  <img
                    src="/src/assets/logo-skillnet.png"
                    alt="SkillNet"
                    className="w-12 h-12 rounded-full border border-white/30"
                  />
                  <div className="text-xs font-semibold tracking-wide uppercase">
                    SkillNet
                  </div>
                </div>

                {/* Elementos decorativos */}
                <div className="absolute right-[-50px] top-[-50px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 bg-cyan-300/10 rounded-full blur-2xl"></div>

                {/* Contenido de la tarjeta */}
                <div className="relative z-10 mt-12">
                  <div className="flex justify-between items-start text-sm">
                    <span className="opacity-90">SkillNet • Suscripciones</span>
                    <span className="opacity-90">{brandIcon}</span>
                  </div>

                  <div className="mt-6 text-2xl tracking-widest font-semibold">
                    {card.padEnd(19, "•") || "•••• •••• •••• ••••"}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="opacity-70">Titular</div>
                      <div className="font-semibold text-white">
                        {name || "NOMBRE APELLIDO"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="opacity-70">Vence</div>
                      <div className="font-semibold text-white">
                        {exp || "MM/AA"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Datos de pago</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Nombre en la tarjeta"
                    placeholder="Como aparece en la tarjeta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Correo electrónico"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={email ? !isEmail(email) : false}
                    helper={
                      email && !isEmail(email) ? "Correo inválido" : undefined
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Número de tarjeta"
                    placeholder="1234 5678 9012 3456"
                    value={card}
                    onChange={(e) => setCard(formatCard(e.target.value))}
                    error={card.length > 0 ? !validCard : false}
                    helper={
                      card && !validCard ? "Debe tener 16 dígitos" : undefined
                    }
                  />
                </div>

                <div>
                  <Input
                    label="Expiración (MM/AA)"
                    placeholder="MM/AA"
                    value={exp}
                    onChange={(e) => setExp(formatExp(e.target.value))}
                    error={exp.length > 0 ? !validExp : false}
                    helper={exp && !validExp ? "Fecha inválida" : undefined}
                  />
                </div>

                <div>
                  <Input
                    label="CVC"
                    placeholder="3 o 4 dígitos"
                    value={cvc}
                    onChange={(e) =>
                      setCvc(e.target.value.replace(/[^\d]/g, "").slice(0, 4))
                    }
                    error={cvc.length > 0 ? !validCvc : false}
                    helper={cvc && !validCvc ? "CVC inválido" : undefined}
                  />
                </div>
              </div>

              <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
                <span>Acepto los términos y condiciones</span>
              </label>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={pay}
                  className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white 
                  ${
                    allOk
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-300 cursor-not-allowed"
                  }`}
                >
                  <FaLock /> Pagar ahora
                </button>
                <Link
                  to="/suscripciones"
                  className="flex-1 text-center rounded-xl px-4 py-3 font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </Link>
              </div>

              <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                Tus datos están cifrados y no almacenamos la información de tu
                tarjeta.
              </div>
            </div>
          </div>

          {/* Col derecha: Resumen */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Resumen</h3>
                {plan?.badge && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-400 text-blue-900 font-bold">
                    {plan.badge}
                  </span>
                )}
              </div>

              {!plan ? (
                <p className="text-sm text-slate-500">Sin plan seleccionado.</p>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold">{plan.title}</div>
                      <div className="text-sm text-slate-500">
                        {plan.services} servicios / mes
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-300">
                      ${plan.price.toLocaleString("es-AR")}
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm">
                    {plan.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <FaStar className="text-yellow-400" /> {p}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-xs text-slate-500">
                    <div>• Se renueva mensualmente.</div>
                    <div>
                      • Podrás cancelar o cambiar de plan cuando quieras.
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI: Input ---------- */
function Input({
  label,
  value,
  onChange,
  placeholder,
  helper,
  error,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helper?: string;
  error?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        className={`mt-1 w-full rounded-xl border px-3 py-3 bg-white dark:bg-slate-950 outline-none transition
        ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-300 dark:border-slate-700 focus:border-blue-500"
        }`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {helper ? <p className="mt-1 text-xs text-red-500">{helper}</p> : null}
    </div>
  );
}
