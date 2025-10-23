// src/ui/alerts.ts
import Swal, { SweetAlertOptions } from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

// 🔒 Estado interno para saber si hay un loader activo
let loadingActive = false;

const baseOptions: SweetAlertOptions = {
  confirmButtonText: "Aceptar",
  cancelButtonText: "Cancelar",
  buttonsStyling: false,
  // Clases opcionales para embeber con MUI/Tailwind
  customClass: {
    popup: "rounded-xl",
    confirmButton:
      "MuiButton-root MuiButton-contained !bg-indigo-600 !text-white !px-4 !py-2 !rounded-lg hover:!bg-indigo-700",
    cancelButton:
      "MuiButton-root MuiButton-outlined !border !border-gray-300 !text-gray-700 !px-4 !py-2 !rounded-lg hover:!bg-gray-100",
  },
};

// 🔧 Cierra el loader si está activo (sin tocar otras alertas)
function closeLoaderIfNeeded() {
  if (loadingActive) {
    Swal.close(); // cierra SOLO si el modal visible es el loader que abrimos
    loadingActive = false;
  }
}

export const showLoading = (title = "Procesando...") => {
  loadingActive = true;
  return MySwal.fire({
    ...baseOptions,
    title,
    allowOutsideClick: false,
    didOpen: () => {
      MySwal.showLoading();
    },
  });
};

export const closeLoading = () => {
  // Solo cierra si el loader está marcado como activo
  closeLoaderIfNeeded();
};

export const alertError = (title: string, text?: string) => {
  closeLoaderIfNeeded();

  const justLoggedOut = sessionStorage.getItem("justLoggedOut") === "1";

  if (justLoggedOut && /sesión\s+no\s+iniciada/i.test(title)) {
    sessionStorage.removeItem("justLoggedOut");
    return Promise.resolve(); // no mostramos alerta
  }

  return MySwal.fire({ ...baseOptions, icon: "error", title, text });
};

export const alertSuccess = (title: string, text?: string) => {
  closeLoaderIfNeeded();
  return MySwal.fire({ ...baseOptions, icon: "success", title, text });
};

export const alertInfo = (title: string, text?: string) => {
  closeLoaderIfNeeded();
  return MySwal.fire({ ...baseOptions, icon: "info", title, text });
};

export const toast = (
  title: string,
  icon: "success" | "error" | "info" | "warning" = "info"
) => {
  // Los toasts no bloquean, pero igual cerramos loader si estaba abierto
  closeLoaderIfNeeded();
  return MySwal.fire({
    ...baseOptions,
    toast: true,
    position: "top-end",
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    icon,
    title,
  });
};

export const confirmDialog = async (
  title: string,
  text?: string,
  confirmText = "Sí, continuar"
) => {
  closeLoaderIfNeeded();
  const res = await MySwal.fire({
    ...baseOptions,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
  });
  return res.isConfirmed;
};
