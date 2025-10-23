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

function App() {
  return (
    <Router>
      <NavbarHandler />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterChoice />} />
          <Route path="/register/user" element={<RegisterUser />} />
          <Route path="/register/provider" element={<RegisterProvider />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />

          {/* Proveedor (nuevo dashboard directo) */}
          <Route
            path="/serviceprovider/dashboard"
            element={<ProviderProfile />}
          />

          {/* Perfil centralizado: decide dashboard por rol */}
          <Route path="/perfil" element={<ProfileRouter />} />

          {/* Rutas que ya estaban en main */}
          <Route path="/solicitar" element={<RequestAppointment />} />
          <Route path="/mis-turnos" element={<MyAppointments />} />
          <Route path="/agenda" element={<ProviderAgenda />} />
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
