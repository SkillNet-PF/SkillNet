import { useAuthContext } from "../contexts/AuthContext";
import DashboardUser from "./DashboardUser";
import DashboardProvider from "./DashboardProvider";

export default function Profile() {
  const { role } = useAuthContext();
  return role === "provider" ? <DashboardProvider /> : <DashboardUser />;
}


