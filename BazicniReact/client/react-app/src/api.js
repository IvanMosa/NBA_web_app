// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log('usao');
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await api.post('/refresh-token', {
                    refreshToken,
                });

                localStorage.setItem('token', response.data.accessToken);

                console.log(response.data.accessToken);
                api.defaults.headers[
                    'Authorization'
                ] = `Bearer ${response.data.accessToken}`;

                originalRequest.headers[
                    'Authorization'
                ] = `Bearer ${response.data.accessToken}`;

                // Ponovo pošalji originalni zahtjev
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
