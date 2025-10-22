import { http } from "./http";



export interface DashboardResponse {
    totals: {
        clients: number;
        providers: number;
        income: number;
        appointments: {
            total: number;
            pending: number;
            confirmed: number;
            completed: number;
            canceled: number;

        }
    }
    activityLog: {
        userName: string;
        action: string;
        date: string;
    }[];
}

export async function getAdminDashboard() : Promise<DashboardResponse> {
   return http<DashboardResponse>("/admin/dashboard", { method: "GET" });
}