import axios, { type AxiosResponse } from 'axios';
import { capitalize } from 'lodash-es';
import type { AuthProvider } from 'react-admin';

const authProvider = (apiUrl: string): AuthProvider => {
    const axiosInstance = axios.create({
        baseURL: apiUrl,
        headers: {
            'X-CSRF-TOKEN': 'admin',
        },
    });
    return {
        login: async ({ username, password }) => {
            await axiosInstance.post<
                undefined,
                undefined,
                { username: string; password: string }
            >('/login', {
                username,
                password,
            });
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
        checkAuth: async (params) => {
            console.log('calling checkAuth', params);
            await axiosInstance.post<unknown, AxiosResponse<{ role: string }>>(
                '/status',
            );
        },
        getPermissions: async () => {
            return Promise.reject();
        },
        canAccess: async ({
            action,
            resource,
        }: { action: string; resource: string }) => {
            const response = await axiosInstance.post<
                unknown,
                AxiosResponse<{ role: string }>
            >('/status');
            console.log('calling canAccess');
            if (response.data.role === 'admin') {
                return true;
            }
            if (
                response.data.role === 'readonly' &&
                ['list', 'show'].includes(action) &&
                ['pieces', 'calendars', 'collaborators'].includes(resource)
            ) {
                return true;
            }
            return false;
        },
        getIdentity: async () => {
            const response = await axiosInstance.post<
                unknown,
                AxiosResponse<{ role: string }>
            >('/status');
            return {
                id: response.data.role,
                fullName: capitalize(response.data.role),
            };
        },
    };
};

export default authProvider;
