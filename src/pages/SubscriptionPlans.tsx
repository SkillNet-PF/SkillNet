import React from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCheckCircle, FaStar, FaCrown, FaBolt } from "react-icons/fa";
import { JSX } from "@emotion/react/jsx-runtime";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { useAuthContext } from "../contexts/AuthContext";


// 🔹 Inicializamos Stripe con la clave pública desde .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

// URL del backend
const API_URL = import.meta.env.VITE_API_URL;

type PlanKey = "BASIC" | "STANDARD" | "PREMIUM";

const PLANS: Record<
  PlanKey,
  {
    name: string;
    services: number;
    price: number;
    icon: JSX.Element;
    highlight?: boolean;
    badge?: string;
  }
> = {
  BASIC: {
    name: "Básico",
    services: 5,
    price: 5000,
    icon: <FaBolt />,
  },
  STANDARD: {
    name: "Standard",
    services: 10,
    price: 8000,
    icon: <FaStar />,
    highlight: true,
    badge: "Más elegido",
  },
  PREMIUM: {
    name: "Premium",
    services: 15,
    price: 12000,
    icon: <FaCrown />,
  },
};

export default function SubscriptionsPage() {
  const navigate = useNavigate();
  const { user } = useAuthContext(); // 🔹 Obtenemos el usuario real

  // 🔹 Cuando el usuario selecciona un plan
  const handleSelect = async (plan: PlanKey) => {
    if (!user) {
      Swal.fire("Error", "Debes iniciar sesión para suscribirte", "error");
      return;
    }

    try {
      Swal.fire({
        title: "Creando checkout…",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // 🔹 Petición al backend para crear sesión de pago
      const response = await axios.post<{ url: string }>(
        `${API_URL}/subscription/checkout`,
        {
          plan,
          userId: user.userId,
        }
      );

      const { url } = response.data;
      Swal.close();

      // 🔹 Redirigir al checkout de Stripe
      window.location.href = url;
    } catch (err: any) {
      Swal.fire("Error", err?.response?.data?.message || err?.message || "No se pudo iniciar el pago.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* … resto de tu JSX igual … */}
      <section className="container mx-auto px-6 pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(PLANS).map(([key, p]) => (
            <article
              key={key}
              className={`relative rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition ${
                p.highlight ? "ring-2 ring-blue-500/40" : ""
              }`}
            >
              {p.badge && (
                <span className="absolute -top-2 left-4 text-xs bg-yellow-400 text-blue-900 px-2 py-0.5 rounded-full font-semibold shadow">
                  {p.badge}
                </span>
              )}

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-blue-600 dark:text-blue-300 text-lg">
                    {p.icon}
                  </div>
                  <h3 className="text-xl font-bold">{p.name}</h3>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold">
                    ${p.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-sm opacity-70">/mes</span>
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Incluye <b>{p.services}</b> servicios por mes.
                </div>

                <ul className="mt-2 space-y-1 text-sm">
                  <Li>Agendá turnos con un clic</Li>
                  <Li>Notificaciones por email</Li>
                  <Li>Cancelación simple</Li>
                  <Li>Soporte por chat</Li>
                </ul>

                <button
                  onClick={() => handleSelect(key as PlanKey)}
                  className={`mt-2 w-full rounded-xl px-4 py-2.5 font-semibold transition ${
                    p.highlight
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                  }`}
                >
                  Elegir {p.name}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- Sub-componentes ---------- */
function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <FaCheckCircle className="text-green-500" />
      <span>{children}</span>
    </li>
  );
}