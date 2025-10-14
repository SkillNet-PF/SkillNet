"use client"

import React, { useState } from "react"
import { registerProvider } from "../services/providers"
import { auth0RegisterUrl } from "../services/auth"

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        if (formData.password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!formData.serviceType) {
            setError("Debes seleccionar un tipo de servicio.");
            return;
        }

        try {
            const res = await registerProvider({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                birthDate: formData.birthdate,
                serviceType: formData.serviceType,
                about: formData.about,
            });
            localStorage.setItem("accessToken", res.accessToken);
            alert("Registro de proveedor completado ✅");
        } catch (err: any) {
            setError(err?.message || "Error registrando proveedor");
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

            <div className="pt-2 grid grid-cols-2 gap-2">
                <a
                    href={auth0RegisterUrl('provider','google-oauth2')}
                    className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span>Continuar con Google</span>
                </a>
                <a
                    href={auth0RegisterUrl('provider','github')}
                    className="flex items-center justify-center gap-2 w-full bg-white border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
                >
                    <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="w-5 h-5" />
                    <span>Continuar con GitHub</span>
                </a>
            </div>
        </form>
    );
}

export default RegisterformProvider
