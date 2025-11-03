// Universal clipboard copy helpers for Nuxt (auto-imported composable)
import { ref } from 'vue';

export async function copyToClipboard(text: string): Promise<boolean> {
    if (!text && text !== "") return false;

    // Modern API
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (_) {
        // fallthrough to legacy path
    }

    // Legacy fallback using a hidden textarea
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);

        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
    } catch (_) {
        return false;
    }
}

export function useCopy() {
    const isCopying = ref(false);
    const error = ref<string | null>(null);

    const copy = async (text: string): Promise<boolean> => {
        isCopying.value = true;
        error.value = null;
        try {
            const ok = await copyToClipboard(text);
            if (!ok) error.value = 'Copy failed';
            return ok;
        } catch (e: any) {
            error.value = e?.message || 'Copy failed';
            return false;
        } finally {
            isCopying.value = false;
        }
    };

    return { copy, isCopying, error };
}


