import { useEffect, useState } from "react";
import { getProviderById, ServiceProvider } from "../services/providers";

export default function DashboardProvider() {
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const providerId = localStorage.getItem("providerId");

  useEffect(() => {
    async function loadProvider() {
      try {
        if (!providerId) {
          setError("No se encontró el ID del proveedor.");
          setLoading(false);
          return;
        }

        const data = await getProviderById(providerId);
        setProvider(data);
      } catch (err) {
        console.error("Error al obtener proveedor:", err);
        setError("Error al cargar los datos del proveedor.");
      } finally {
        setLoading(false);
      }
    }

    loadProvider();
  }, [providerId]);

  if (loading) return <p className="text-center mt-10">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-500 mt-10">{error}</p>;
  if (!provider) return <p>No se encontraron datos del proveedor.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-10">
      <h1 className="text-3xl font-bold text-center mb-4">
        Bienvenido, {provider.name}
      </h1>
      <p className="text-center text-gray-600 mb-6">
        {provider.email} — {provider.address}
      </p>

      <div className="flex justify-center mb-6">
        {provider.imgProfile ? (
          <img
            src={provider.imgProfile}
            alt={provider.name}
            className="w-32 h-32 rounded-full object-cover border"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            Sin foto
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Información general</h2>
        <p><strong>Tipo de servicio:</strong> {provider.serviceType}</p>
        <p><strong>Teléfono:</strong> {provider.phone}</p>
        <p><strong>Estado:</strong> {provider.isActive ? "Activo" : "Inactivo"}</p>
        <p><strong>Sobre mí:</strong> {provider.about || "No especificado"}</p>
        <p><strong>Días de atención:</strong> {provider.dias?.join(", ") || "No definidos"}</p>
        <p><strong>Horarios:</strong> {provider.horarios?.join(", ") || "No definidos"}</p>
        {provider.category && (
          <p><strong>Categoría:</strong> {provider.category.name}</p>
        )}
      </div>
    </div>
  );
}