import { ElMessage } from 'element-plus';

interface MyAlert1 {
    (message: string): void;
    keep(message: string): void;
}

type MyAlert2 = MyAlert1 & {
    html: MyAlert1;
};

type MyAlert = MyAlert2 & {
    primary: MyAlert2;
    success: MyAlert2;
    warning: MyAlert2;
    error: MyAlert2;
};

type Types = 'error' | 'info' | 'primary' | 'success' | 'warning';

const buildMyAlert0 = (keep: boolean, type: Types, html: boolean) => (message: string) =>
    ElMessage({
        message,
        dangerouslyUseHTMLString: html,
        type,
        showClose: true,
        duration: keep ? 0 : undefined,
    });

const buildMyAlert1 = (html: boolean, type: Types) => {
    const result = buildMyAlert0(false, type, html) as unknown as MyAlert1;
    result.keep = buildMyAlert0(true, type, html);
    return result;
};

const buildMyAlert2 = (type: Types) => {
    const result = buildMyAlert1(false, type) as unknown as MyAlert2;
    result.html = buildMyAlert1(true, type);
    return result;
};

const buildMyAlert = () => {
    const result = buildMyAlert2('info') as unknown as MyAlert;
    result.primary = buildMyAlert2('primary');
    result.success = buildMyAlert2('success');
    result.warning = buildMyAlert2('warning');
    result.error = buildMyAlert2('error');
    return result;
};

export const myAlert = buildMyAlert();
