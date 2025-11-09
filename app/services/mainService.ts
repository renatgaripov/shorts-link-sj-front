import type { SaveLink } from "~/types/links";

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
    method?: RequestMethod;
    body?: any;
    headers?: Record<string, string>;
}

export default class MainService {
    private readonly baseUrl = '/api';

    private readonly defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { method = 'GET', body, headers = {} } = options;

        const url = `${this.baseUrl}${endpoint}`;
        const requestHeaders = {
            ...this.defaultHeaders,
            ...headers,
        };

        const authToken = useCookie('authToken4clk');
        if (authToken.value) {
            // @ts-ignore
            requestHeaders['Authorization'] = `Bearer ${authToken.value}`;
        }

        const config: RequestInit = {
            method,
            headers: requestHeaders,
        };

        if (body && method !== 'GET') {
            config.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                authToken.value = '';
                throw new Error('Unauthorized');
            }
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Проверяем, есть ли тело ответа
            const contentType = response.headers.get('content-type');
            const contentLength = response.headers.get('content-length');

            // Если ответ пустой или не JSON, возвращаем пустой объект
            if (!contentType || !contentType.includes('application/json') ||
                (contentLength && parseInt(contentLength) === 0)) {
                return {} as T;
            }

            const data = await response.json();
            return data as T;
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    }

    public async login(login: string, password: string) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { login, password },
        });
    }

    public async getAllLinks(search?: string, page: number = 1, limit?: number) {
        const params = new URLSearchParams();
        if (search) {
            params.append('q', search);
        }
        params.append('page', page.toString());
        if (limit) {
            params.append('limit', limit.toString());
        }
        const endpoint = `/short-link?${params.toString()}`;
        return this.request(endpoint, {
            method: 'GET',
        });
    }

    // async getAllLinks(search?: string): Promise<Link[]> {
    //     const endpoint = search ? `/links?search=${encodeURIComponent(search)}` : '/links';
    //     return await this.request<Link[]>(endpoint);
    // }

    public async deleteLink(id: number | string) {
        return this.request(`/short-link/${id}`, {
            method: 'DELETE',
        });
    }

    public async createLink(link: SaveLink) {
        return this.request('/short-link', {
            method: 'POST',
            body: link,
        });
    }

    public async getAllAdmins(search?: string, page: number = 1, limit?: number) {
        const params = new URLSearchParams();
        if (search) {
            params.append('q', search);
        }
        params.append('page', page.toString());
        if (limit) {
            params.append('limit', limit.toString());
        }
        const endpoint = `/users?${params.toString()}`;
        return this.request(endpoint, {
            method: 'GET',
        });
    }

    public async updateAdmin(id: string, data: any) {
        return this.request(`/users/${id}`, {
            method: 'PUT',
            body: data,
        });
    }

    public async createAdmin(data: any) {
        return this.request('/users', {
            method: 'POST',
            body: data,
        });
    }

    public async deleteAdmin(id: string) {
        return this.request(`/users/${id}`, {
            method: 'DELETE',
        });
    }
}