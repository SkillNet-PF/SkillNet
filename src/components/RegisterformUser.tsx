"use client";

import React, { useEffect, useState } from "react";
import { registerUser } from "../services/clients";
import { auth0RegisterUrl } from "../services/auth";
import {
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

function RegisterformUser() {
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phone: "",
    subscription: "",
    paymentMethod: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Validaciones dinámicas de contraseña
  const [validations, setValidations] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSymbol: false,
    minLength: false,
  });

  const [emailValid, setEmailValid] = useState(true);

  useEffect(() => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(regex.test(formData.email));
  }, [formData.email]);

  useEffect(() => {
    setValidations({
      hasUppercase: /[A-Z]/.test(formData.password),
      hasLowercase: /[a-z]/.test(formData.password),
      hasNumber: /[0-9]/.test(formData.password),
      hasSymbol: /[^A-Za-z0-9]/.test(formData.password),
      minLength: formData.password.length >= 8,
    });
  }, [formData.password]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const isPasswordValid =
    validations.hasUppercase &&
    validations.hasLowercase &&
    validations.hasNumber &&
    validations.hasSymbol &&
    validations.minLength;

  const isFormValid =
    isPasswordValid &&
    emailValid &&
    formData.password === formData.confirmPassword &&
    formData.subscription &&
    formData.paymentMethod &&
    formData.phone.match(/^\+?\d{7,15}$/);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isFormValid) {
      setError("Por favor completa todos los campos correctamente.");
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        birthDate: formData.birthDate,
        address: formData.address,
        phone: formData.phone,
        rol: "client",
        paymentMethod: formData.paymentMethod,
        subscription: formData.subscription,
      });

      localStorage.setItem("accessToken", res.accessToken);
      alert("Registro de usuario completado ✅");
    } catch (err: any) {
      setError(err?.message || "Error registrando usuario");
    } finally {
      setLoading(false);
    }
  };

  const renderValidation = (isValid: boolean, text: string) => (
    <p
      className={`flex items-center text-sm transition-colors duration-300 ${
        isValid ? "text-green-600" : "text-gray-500"
      }`}
    >
      {isValid ? (
        <FaCheckCircle className="mr-2" />
      ) : (
        <FaTimesCircle className="mr-2" />
      )}
      {text}
    </p>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center text-blue-600">
        Registro de Usuario
      </h2>

      {error && (
        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
      )}

      <div className="space-y-3">
        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={formData.name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          value={formData.email}
          onChange={handleChange}
          className={`w-full border ${
            emailValid ? "border-gray-300" : "border-red-500"
          } p-2 rounded focus:ring-2 ${
            emailValid ? "focus:ring-blue-400" : "focus:ring-red-400"
          } outline-none`}
          required
        />

        {/* Contraseña */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 pr-10 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
          </button>
        </div>

        {/* Validaciones dinámicas */}
        <div className="mt-2 space-y-1">
          {renderValidation(validations.hasUppercase, "Una letra mayúscula")}
          {renderValidation(validations.hasLowercase, "Una letra minúscula")}
          {renderValidation(validations.hasNumber, "Un número")}
          {renderValidation(validations.hasSymbol, "Un símbolo (!, $, #, etc.)")}
          {renderValidation(validations.minLength, "Mínimo 8 caracteres")}
        </div>

        {/* Confirmar Contraseña */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 pr-10 rounded focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            {showConfirmPassword ? (
              <FaEyeSlash size={18} />
            ) : (
              <FaEye size={18} />
            )}
          </button>
        </div>

        {/* Otros campos */}
        <input
          type="text"
          name="address"
          placeholder="Dirección"
          value={formData.address}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Teléfono"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <select
          name="subscription"
          value={formData.subscription}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option value="">Selecciona un plan</option>
          <option value="basic">Básico</option>
          <option value="standard">Estándar</option>
          <option value="premium">Premium</option>
        </select>

        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option value="">Selecciona método de pago</option>
          <option value="tarjeta_credito">Tarjeta de Crédito</option>
          <option value="paypal">PayPal</option>
          <option value="transferencia">Transferencia Bancaria</option>
        </select>
      </div>

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full p-2 rounded font-medium transition ${
          isFormValid && !loading
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>

      <div className="pt-2 grid grid-cols-2 gap-2">
        <a
          href={auth0RegisterUrl("client", "google-oauth2")}
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Google</span>
        </a>
        <a
          href={auth0RegisterUrl("client", "github")}
          className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
        >
          <img
            src="https://www.svgrepo.com/show/512317/github-142.svg"
            alt="GitHub"
            className="w-5 h-5"
          />
          <span>GitHub</span>
        </a>
      </div>
    </form>
  );
}

export default RegisterformUser;