import axios from "axios";




export async function registerUser(data: {
    name: string;
    birthdate: string;
    email: string;
    password: string;
    membership: string;
}) {
    try {
        const response = await axios.post(`/auth/register`,data);
        return response.data;
    } catch (error: any) {
        console.error("Error en registro de usuario:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "error al registrar usuario");
    }
}