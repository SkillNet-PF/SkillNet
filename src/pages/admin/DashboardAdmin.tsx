import { useEffect, useState } from "react";
import { Card, CardContent, Button } from "@mui/material";
import { BarChart3, Users, Calendar, Settings } from "lucide-react";
import { getAdminDashboard, DashboardResponse } from "../../services/admin";

export default function DashboardAdmin() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getAdminDashboard();
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || "Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-8">Cargando dashboard...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="text-blue-600" /> Panel de Administración
      </h1>

      {/* MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-500 text-sm">Clientes</p>
              <p className="text-2xl font-bold">
                {data?.totals.clients ?? 0}
              </p>
            </div>
            <Users className="text-blue-600" size={32} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-500 text-sm">Proveedores</p>
              <p className="text-2xl font-bold">
                {data?.totals.providers ?? 0}
              </p>
            </div>
            <Settings className="text-green-600" size={32} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-500 text-sm">Citas Totales</p>
              <p className="text-2xl font-bold">
                {data?.totals.appointments.total ?? 0}
              </p>
            </div>
            <Calendar className="text-purple-600" size={32} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-gray-500 text-sm">Ingresos</p>
              <p className="text-2xl font-bold">
                ${data?.totals.income.toLocaleString() ?? 0}
              </p>
            </div>
            <BarChart3 className="text-orange-600" size={32} />
          </CardContent>
        </Card>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <Card>
          <CardContent className="p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-gray-600">Usuario</th>
                  <th className="p-2 text-gray-600">Acción</th>
                  <th className="p-2 text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data?.activityLog?.length ? (
                  data.activityLog.map((log, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2">{log.userName}</td>
                      <td className="p-2">{log.action}</td>
                      <td className="p-2 text-gray-500">
                        {log.date}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-500">
                      No hay actividad reciente
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* BOTÓN DE ACTUALIZACIÓN */}
      <div className="flex justify-center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Actualizar datos
        </Button>
      </div>
    </div>
  );
}
