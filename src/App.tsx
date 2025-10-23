import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RegisterProvider from "./pages/RegisterProvider";
import NotFound from "./pages/NotFound";
import RegisterChoice from "./pages/RegisterChoice";
import NavbarHandler from "./components/NavbarHandler";
import MyAppointments from "./pages/MyAppointments";
import ProviderAgenda from "./pages/ProviderAgenda";
import AuthCallback from "./pages/AuthCallback";
import RequestAppointment from "./pages/RequestAppointment";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import ProfileRouter from "./pages/ProfileRouter";
import ProviderProfile from "./pages/DashboardProvider";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import SearchResults from "./pages/SearchResults";
import Unauthorized from "./pages/Unauthorized";
import RoleGuard from "./components/RoleGuard";
import PublicOnlyRoute from "./components/PublicOnlyRoutes";

function App() {
  return (
    <Router>
      <NavbarHandler />
      <main>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterChoice />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register/user"
            element={
              <PublicOnlyRoute>
                <RegisterUser />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register/provider"
            element={
              <PublicOnlyRoute>
                <RegisterProvider />
              </PublicOnlyRoute>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard allowedRoles={["admin"]}>
                <DashboardAdmin />
              </RoleGuard>
            }
          />

          {/* Proveedor */}
          <Route
            path="/serviceprovider/dashboard"
            element={
              <RoleGuard allowedRoles={["provider"]}>
                <ProviderProfile />
              </RoleGuard>
            }
          />
          <Route
            path="/agenda"
            element={
              <RoleGuard allowedRoles={["provider"]}>
                <ProviderAgenda />
              </RoleGuard>
            }
          />

          {/* Cliente */}
          <Route
            path="/mis-turnos"
            element={
              <RoleGuard allowedRoles={["client"]}>
                <MyAppointments />
              </RoleGuard>
            }
          />
          <Route
            path="/solicitar"
            element={
              <RoleGuard allowedRoles={["client"]}>
                <RequestAppointment />
              </RoleGuard>
            }
          />

          {/* Perfil (client o provider) */}
          <Route
            path="/perfil"
            element={
              <RoleGuard allowedRoles={["client", "provider"]}>
                <ProfileRouter />
              </RoleGuard>
            }
          />

          {/* Público (suscripciones / pago) */}
          <Route path="/suscripciones" element={<SubscriptionPlans />} />
          <Route path="/pago/checkout" element={<CheckoutPage />} />
          <Route path="/pago/success" element={<PaymentSuccess />} />
          <Route path="/pago/cancel" element={<PaymentCancel />} />

          {/* Búsqueda */}
          <Route path="/search" element={<SearchResults />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
