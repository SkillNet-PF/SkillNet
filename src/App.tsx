import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import RegisterProvider from "./pages/RegisterProvider";
import NotFound from "./pages/NotFound";
import RegisterChoice from "./pages/RegisterChoice";
import NavbarHandler from "./components/NavbarHandler";
import UserProfile from "./pages/DashboardUser";
import AuthCallback from "./pages/AuthCallback";
import DashboardAdmin from "./pages/admin/DashboardAdmin";

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
          <Route path="/admin/dashboard" element={<DashboardAdmin />} />
          <Route path="/perfil" element={<UserProfile />} /> 
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
