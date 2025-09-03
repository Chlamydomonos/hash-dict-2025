import { myAlert } from '@/lib/my-alert';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSessionStore = defineStore(
    'session',
    () => {
        const userName = ref<string>();
        const passwordHash = ref<string>();
        const sessionToken = ref<string>();
        const loggedIn = ref(false);

        const keepAlive = async () => {
            if (loggedIn.value) {
                try {
                    await loginRequest('/user/keepalive', {});
                } catch (e) {
                    if (e instanceof NotLoggedInError) {
                        myAlert.warning('登录已失效，请重新登录');
                    } else {
                        myAlert.warning('验证登录状态失败：网络错误');
                    }
                }
            }
        };

        setInterval(keepAlive, 1000 * 60 * 5);
        setTimeout(keepAlive, 1000);

        return { userName, passwordHash, sessionToken, loggedIn };
    },
    {
        persist: true,
    },
);
