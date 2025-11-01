type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface AppToast {
    id: number;
    message: string;
    type: ToastType;
    timeout: number;
}

let seed = 1;

export function useToast() {
    const toasts = useState<AppToast[]>('app_toasts', () => []);

    const remove = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const show = (message: string, type: ToastType = 'info', timeout = 3000) => {
        const id = seed++;
        const toast: AppToast = { id, message, type, timeout };
        toasts.value = [...toasts.value, toast];
        if (timeout > 0 && typeof window !== 'undefined') {
            setTimeout(() => remove(id), timeout);
        }
        return id;
    };

    return {
        toasts,
        show,
        remove,
    };
}


