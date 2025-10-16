"use client";

import React, { useState } from "react";
import { registerProvider } from "../services/providers";
import { auth0RegisterUrl } from "../services/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function RegisterformProvider() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    serviceType: "",
    about: "",
    days: "",
    horarios: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Ingresa tu nombre.";
    if (!formData.email.trim()) newErrors.email = "Ingresa un correo.";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido.";
    }

    if (formData.password.length < 6)
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Las contraseñas no coinciden.";

    if (!formData.serviceType)
      newErrors.serviceType = "Debes seleccionar un tipo de servicio.";

    if (!/^\+?\d{7,15}$/.test(formData.phone))
      newErrors.phone = "Por favor ingresa un número de teléfono válido.";

    if (!formData.days.trim() || !formData.horarios.trim())
      newErrors.days = "Debes completar los días y horarios de disponibilidad.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      const res = await registerProvider({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        address: formData.address,
        phone: formData.phone,
        rol: "provider",
        serviceType: formData.serviceType,
        about: formData.about,
        days: formData.days,
        horarios: formData.horarios,
      });

      localStorage.setItem("accessToken", res.accessToken);
      setSuccess("Registro de proveedor completado ✅");

      setFormData({
        name: "",
        birthDate: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        phone: "",
        serviceType: "",
        about: "",
        days: "",
        horarios: "",
      });
      setErrors({});
      setTimeout(() => navigate("/DashboardProvider"), 600);
    } catch (err: any) {
      setErrors({ general: err?.message || "Error registrando proveedor" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center text-green-600">
        Registro de Proveedor
      </h2>

      {success && (
        <p className="text-green-600 text-sm text-center font-medium">{success}</p>
      )}
      {errors.general && (
        <p className="text-red-500 text-sm text-center font-medium">
          {errors.general}
        </p>
      )}

      <div className="space-y-3">
        <div>
          <input
            type="text"
            name="name"
            placeholder="Nombre completo"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border border-gray-300 p-2 rounded focus:ring-2 outline-none ${
              errors.name ? "border-red-500 focus:ring-red-400" : "focus:ring-green-400"
            }`}
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border p-2 rounded focus:ring-2 outline-none ${
              errors.email ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"
            }`}
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Contraseña */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className={`w-full border p-2 pr-10 rounded focus:ring-2 outline-none ${
              errors.password ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Confirmar Contraseña */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full border p-2 pr-10 rounded focus:ring-2 outline-none ${
              errors.confirmPassword ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
          {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <input
            type="text"
            name="address"
            placeholder="Dirección"
            value={formData.address}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            className={`w-full border p-2 rounded focus:ring-2 outline-none ${
              errors.phone ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"
            }`}
            required
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className={`w-full border p-2 rounded focus:ring-2 outline-none ${
              errors.serviceType ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"
            }`}
            required
          >
            <option value="">Selecciona tu servicio</option>
            <option value="plomeria">Plomería</option>
            <option value="electricidad">Electricidad</option>
            <option value="carpinteria">Carpintería</option>
            <option value="otros">Otros</option>
          </select>
          {errors.serviceType && <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>}
        </div>

        <div>
          <textarea
            name="about"
            placeholder="Cuéntanos sobre tu servicio (experiencia, herramientas, etc.)"
            value={formData.about}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded h-24 focus:ring-2 focus:ring-green-400 outline-none resize-none"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="days"
            placeholder="Días disponibles (ej: lunes,martes,miercoles)"
            value={formData.days}
            onChange={handleChange}
            className={`w-full border p-2 rounded focus:ring-2 outline-none ${
              errors.days ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-green-400"
            }`}
            required
          />
          {errors.days && <p className="text-red-500 text-sm mt-1">{errors.days}</p>}
        </div>

        <div>
          <input
            type="text"
            name="horarios"
            placeholder="Horarios disponibles (ej: 09:00,18:00)"
            value={formData.horarios}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full ${loading ? "bg-gray-300 text-gray-600" : "bg-green-600 text-white hover:bg-green-700"} p-2 rounded transition-colors`}
      >
        {loading ? "Registrando..." : "Registrarse como Proveedor"}
      </button>

      <div className="pt-2 grid grid-cols-2 gap-2">
        <a
          href={auth0RegisterUrl("provider", "google-oauth2")}
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          <span>Continuar con Google</span>
        </a>
        <a
          href={auth0RegisterUrl("provider", "github")}
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
        >
          <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5" />
          <span>Continuar con GitHub</span>
        </a>
      </div>
    </form>
  );
}
