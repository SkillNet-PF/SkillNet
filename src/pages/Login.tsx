// src/pages/Login.tsx
import { useEffect } from "react";
import LoginForm from "../components/Loginform";

function Login() {
  useEffect(() => {
    // Si venimos de "Salir", limpia el flag aquí (no en http.ts)
    if (sessionStorage.getItem("justLoggedOut") === "1") {
      sessionStorage.removeItem("justLoggedOut");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}

export default Login;
