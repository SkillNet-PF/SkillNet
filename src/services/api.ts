import axios, {AxiosError} from 'axios';

//const BACK_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: "/",
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        
        const token = localStorage.getItem('authToken'); 

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; 
    },
    (error) => {
        return Promise.reject(error);
    }
);
interface LoginResult { 
    success: boolean; 
    role?: 'user' | 'provider'; 
    message?: string;
    token?: string;
};

interface ErrorResponseData {
  message?: string; 
}


export default async function login(email: string, password: string): Promise<LoginResult> {
    try {
        
        const response = await axiosInstance.post('/auth/login', { 
            email, 
            password,
        });
        
        
        const { accesToken, user } = response.data;

        localStorage.setItem('authToken', accesToken);
        localStorage.setItem('userRole', user.rol || user.role); 

        
        return {
            success: true,
            role: user.rol || user.role, 
            token: accesToken
        }

    } catch (error) {

        const axiosError = error as AxiosError<ErrorResponseData>; 

        console.error("Error de login en API Service:", axiosError.response?.data || error);

        
        return {
            success: false,
            message: axiosError.response?.data?.message || 'Credenciales inválidas. Verifica tu conexión.'
        };
    }
}




