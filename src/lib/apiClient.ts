import axios from "axios";
import Cookies from "js-cookie";

const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL ;
    
    return url;
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    timeout: 10000,
});

// Request: Add token from cookies
apiClient.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response: Handle 401, network errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.log("ApiClient: 401 Unauthorized detected. Redirecting to login.");
            Cookies.remove("token");
            if (typeof window !== "undefined") window.location.href = "/auth/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;
