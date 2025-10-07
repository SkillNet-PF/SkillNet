"use client";

import React, { useState } from "react";

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // limpiar errores al escribir
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!formData.membership) {
      setError("Debes seleccionar una membresía.");
      return;
    }

    console.log("Datos de registro de usuario:", formData);
    alert("Registro de usuario completado ✅ (simulado)");

    // Aquí luego conectarás al backend o AuthContext
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
      >
        Registrarse
      </button>
    </form>
  )
}

export default RegisterformUser