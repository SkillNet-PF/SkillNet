import React from "react";
import {  useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FaCheckCircle, FaStar, FaCrown, FaBolt } from "react-icons/fa";
import { JSX } from "@emotion/react/jsx-runtime";
//import { FaArrowLeft } from "react-icons/fa";
//import { Button } from "../ui";

// Si ya tienes un cliente axios/fetch, puedes importarlo
// import api from "../services/api";

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

  // Cambia este flag si quieres llamar al backend de Stripe en lugar de navegar al mock
  const USE_BACKEND_CHECKOUT = false;

  const handleSelect = async (plan: PlanKey) => {
    if (USE_BACKEND_CHECKOUT) {
      try {
        Swal.fire({
          title: "Creando checkout…",
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading(),
        });

        // Llama a tu backend real
        // const { data } = await api.post("/subscription/checkout", { plan, userId: "<userId>" });
        // window.location.href = data.url;

        // Para la maqueta, simulamos:
        setTimeout(() => {
          Swal.close();
          navigate(`/pago/checkout?plan=${plan.toLowerCase()}`);
        }, 600);
      } catch (err: any) {
        Swal.fire(
          "Ups",
          err?.message || "No se pudo iniciar el pago.",
          "error"
        );
      }
    } else {
      // Maqueta: solo navega a tu pasarela mock
      navigate(`/pago/checkout?plan=${plan.toLowerCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* HERO compacto */}
      <section className="container mx-auto px-6 pt-8 pb-4">
        {/* <Link
          to="/profile"
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600"
        >
          <FaArrowLeft />
          Volver al perfil
        </Link> */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 dark:text-blue-300">
              Activa tu suscripción
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Elige un plan y comienza a agendar servicios con proveedores
              verificados.
            </p>
          </div>
          <p className="text-sm opacity-80">
            ¿Tienes dudas? Revisa la comparativa más abajo.
          </p>
        </div>
      </section>

      {/* GRID de planes (compacto) */}
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

      {/* COMPARATIVA breve (llena el espacio y ayuda a decidir) */}
      <section className="container mx-auto px-6 pb-12">
        <div className="rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-5 py-3 border-b dark:border-slate-800">
            <h4 className="font-semibold">Comparativa rápida</h4>
          </div>
          <div className="grid grid-cols-4 text-sm">
            <Row title="Servicios / mes" values={[5, 10, 15]} />
            <Row
              title="Precio / mes"
              values={["$5.000", "$8.000", "$12.000"]}
            />
            <Row title="Soporte" values={["Básico", "Prioritario", "VIP"]} />
            <Row
              title="Cancelación"
              values={["24h de antelación", "12h de antelación", "Flexible"]}
            />
          </div>
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

function Row({
  title,
  values,
}: {
  title: string;
  values: (string | number)[];
}) {
  return (
    <>
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/40 font-medium">
        {title}
      </div>
      {values.map((v, i) => (
        <div
          key={i}
          className="px-4 py-3 border-l dark:border-slate-800 flex items-center"
        >
          {v}
        </div>
      ))}
    </>
  );
}
