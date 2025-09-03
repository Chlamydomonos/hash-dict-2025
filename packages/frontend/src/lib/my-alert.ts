import { useNextAlertStore } from '@/stores/next-alert';
import { ElMessage } from 'element-plus';

interface MyAlert1 {
    (message: string): void;
    next(message: string): void;
}

type MyAlert2 = MyAlert1 & {
    (message: string): void;
    keep(message: string): void;
};

type MyAlert3 = MyAlert2 & {
    html: MyAlert2;
};

type MyAlert = MyAlert3 & {
    primary: MyAlert3;
    success: MyAlert3;
    warning: MyAlert3;
    error: MyAlert3;
};

type Types = 'error' | 'info' | 'primary' | 'success' | 'warning';

const buildMyAlert0 = (keep: boolean, type: Types, html: boolean, next: boolean) => (message: string) => {
    if (next) {
        const store = useNextAlertStore();
        store.values.push({ keep, type, html, message });
    } else {
        ElMessage({
            message,
            dangerouslyUseHTMLString: html,
            type,
            showClose: true,
            duration: keep ? 0 : undefined,
        });
    }
};

const buildMyAlert1 = (keep: boolean, type: Types, html: boolean) => {
    const result = buildMyAlert0(keep, type, html, false) as unknown as MyAlert1;
    result.next = buildMyAlert0(keep, type, html, true);
    return result;
};

const buildMyAlert2 = (html: boolean, type: Types) => {
    const result = buildMyAlert1(false, type, html) as unknown as MyAlert2;
    result.keep = buildMyAlert1(true, type, html);
    return result;
};

const buildMyAlert3 = (type: Types) => {
    const result = buildMyAlert2(false, type) as unknown as MyAlert3;
    result.html = buildMyAlert2(true, type);
    return result;
};

const buildMyAlert = () => {
    const result = buildMyAlert3('info') as unknown as MyAlert;
    result.primary = buildMyAlert3('primary');
    result.success = buildMyAlert3('success');
    result.warning = buildMyAlert3('warning');
    result.error = buildMyAlert3('error');
    return result;
};

export const myAlert = buildMyAlert();
