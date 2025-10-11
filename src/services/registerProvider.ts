import axios from "axios";

const axiosInstance = axios.create({

    baseURL: "/",
    headers: {
        'Content-Type': ' application/json'
    },
});

interface ProviderData {
    name: string;
    birthdate: string;
    email: string;
    password: string;
    serviceType: string;
    about: string;
}


export async function registerProvider (data:ProviderData) {

    try {
      const response = await axiosInstance.post('auth/provider', data);
      return response.data;
    } catch (error: any) {
        console.error("Error en registro de proveedor:", error.response?.data || error.message);

        throw new Error(error.response?.data?.message || "Error al conectar con el servicio de registro")
    }
}