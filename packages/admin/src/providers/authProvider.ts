import axios from 'axios';
import { AuthProvider } from 'react-admin';

const authProvider = (apiUrl: string): AuthProvider => {
    const axiosInstance = axios.create({
        baseURL: apiUrl,
        headers: {
            'X-CSRF-TOKEN': 'admin',
        },
    });
    return {
        login: async ({ username, password }) => {
            await axiosInstance.post<{}, {}, { username: string; password: string; }>(
                '/login',
                {
                    username,
                    password,
                }
            );
        },
        checkError: (error) => {
            const status = error.status;
            if (status === 401 || status === 403) {
                return Promise.reject();
            }
            return Promise.resolve();
        },
        logout: async () => {
            try {
                await axiosInstance.post('/logout');
            } catch (e) {
                console.log(`Wasn't logged in.`);
            }
        },
        checkAuth: async () => {
            await axiosInstance.post('/status');
        },
        getPermissions: async () => {
            return;
        },
        getIdentity: async () => {
            return ({ id: 'admin', fullName: 'Admin' });
        }
    };
};

export default authProvider;