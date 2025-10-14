import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";
import { http } from "../services/http";

function AuthCallback() {
  const { setRole } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const role = params.get("role");
    if (token) localStorage.setItem("accessToken", token);
    if (role === "provider" || role === "client") setRole(role === "provider" ? "provider" : "user");

    http<{ user: any }>("/auth/me").then((res) => {
   
    }).finally(() => {
      navigate("/", { replace: true });
    });
  }, [location.search, navigate, setRole]);

  return null;
}

export default AuthCallback;


