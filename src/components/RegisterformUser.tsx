"use client";

import React, { useState } from "react";
import { registerUser } from "../services/registerUser";

function RegisterformUser() {
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    email: "",
    password: "",
    confirmPassword: "",
    membership: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
    setSuccess(false);
  };

  const validateForm = () => {
    const { name, birthdate, email, password, confirmPassword, membership } = formData;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    if (!membership) {
      setError("Debes seleccionar una membresía.");
      return false;
    }

    if (!/^[a-zA-Z\s]+$/.test(name) || name.trim().length < 3) {
      setError("El nombre debe contener solo letras y tener al menos 3 caracteres.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, introduce un formato de correo electrónico válido.");
      return false;
    }

    const birthDateObj = new Date(birthdate);
    const today = new Date();

    const ageLimit = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

    if (birthDateObj >= ageLimit) {
      setError("Debes tener al menos 18 años para registrarte.");
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener: Mín. 8 caracteres, al menos 1 mayúscula, 1 número y 1 símbolo (@$!%*?&).");
      return false;
    }

    setError("");
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...payload } = formData;

      const response = await registerUser(payload);

      console.log("Registro exitoso", response);
      setSuccess(true);

      setFormData({
        name: "",
        birthdate: "",
        email: "",
        password: "",
        confirmPassword: "",
        membership: "",
      });

    } catch (err: any) {
      setError(err.message || "Error al registrar usuario. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-lg space-y-4 max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center text-blue-600">
        Registro de Usuario
      </h2>

      {error && (
        <p className="text-red-500 text-sm text-center font-medium">
          {error}
        </p>

      )}

      {success && (
        <p className="text-green-500 text-sm text-center font-medium">
          Registro exitoso 🎉
        </p>
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
          name="birthdate"
          value={formData.birthdate}
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
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirmar contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        />

        <select
          name="membership"
          value={formData.membership}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-400 outline-none"
          required
        >
          <option value="">Selecciona una membresía</option>
          <option value="basic">Básica</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
    </form>
  )
}

export default RegisterformUser