import { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import { BarChart3, Users, Calendar, Settings } from "lucide-react";

interface SummaryData {
  totalUsers: number;
  totalProviders: number;
  totalAppointments: number;
  totalRevenue: number;
}

export default function DashboardAdmin() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulación temporal de datos del backend
  useEffect(() => {
    setTimeout(() => {
      setSummary({
        totalUsers: 1320,
        totalProviders: 48,
        totalAppointments: 250,
        totalRevenue: 9400,
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-500 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-400"></div>
        Cargando panel del administrador...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Panel del Administrador</h1>
        <Button variant="outlined" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configuración
        </Button>
      </header>

      {/* Cards resumen */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Usuarios Registrados</p>
                <h2 className="text-2xl font-semibold">{summary?.totalUsers}</h2>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Proveedores</p>
                <h2 className="text-2xl font-semibold">{summary?.totalProviders}</h2>
              </div>
              <BarChart3 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Turnos Totales</p>
                <h2 className="text-2xl font-semibold">{summary?.totalAppointments}</h2>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ingresos (USD)</p>
                <h2 className="text-2xl font-semibold">${summary?.totalRevenue}</h2>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabla de actividad reciente */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Actividad reciente
        </h2>
        <div className="bg-white shadow rounded-2xl p-4">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="border-b font-semibold text-gray-800">
              <tr>
                <th className="py-2 px-3">Usuario</th>
                <th className="py-2 px-3">Acción</th>
                <th className="py-2 px-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 px-3">Juan Pérez</td>
                <td className="py-2 px-3">Registró una cuenta</td>
                <td className="py-2 px-3">16/10/2025</td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-3">María López</td>
                <td className="py-2 px-3">Agendó un turno</td>
                <td className="py-2 px-3">16/10/2025</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Carlos Díaz</td>
                <td className="py-2 px-3">Canceló un turno</td>
                <td className="py-2 px-3">15/10/2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}