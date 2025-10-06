"use client"

import React, { useState } from "react"

function RegisterformProvider() {

    const [formData, setFormData] = useState({

        name: "",
        birthdate: "",
        email: "",
        password: "",
        confirmPassword: "",
        serviceType: "",
        about: "",
    });

    const [error, setError] = useState("");

    const handleChange = (

        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

    ) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();


        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!formData.serviceType) {
            setError("Debes seleccionar un tipo de servicio.");
            return;
        }

        console.log("Datos de registro de proveedor:", formData);
        alert("Registro de proveedor completado ✅ (simulado)");

    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg space-y-4 max-w-md mx-auto"
        >
            <h2 className="text-2xl font-bold text-center text-green-600">
                Registro de Proveedor
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
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    required
                />

                <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    required
                />

                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    required
                />

                <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    required
                >
                    <option value="">Selecciona tu servicio</option>
                    <option value="plomeria">Plomería</option>
                    <option value="electricidad">Electricidad</option>
                    <option value="carpinteria">Carpintería</option>
                    <option value="otros">Otros</option>
                </select>

                <textarea
                    name="about"
                    placeholder="Cuéntanos sobre tu servicio (experiencia, herramientas, etc.)"
                    value={formData.about}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-2 rounded h-24 focus:ring-2 focus:ring-green-400 outline-none resize-none"
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors"
            >
                Registrarse como Proveedor
            </button>
        </form>
    );
}

export default RegisterformProvider
