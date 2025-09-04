<template>
    <div class="login-container" ref="loginContainer">
        <ElCard class="login-card" header-class="login-card-header">
            <template #header>
                <h1 class="center-header">登录</h1>
            </template>
            <ElForm label-width="auto" :rules="rules" :model="form" ref="formRef">
                <ElFormItem label="用户名" prop="name">
                    <ElInput v-model="form.name" />
                </ElFormItem>
                <ElFormItem label="密码" prop="password">
                    <ElInput v-model="form.password" show-password />
                </ElFormItem>
                <ElRow class="button-container">
                    <ElButton @click="handleLogin">登录</ElButton>
                    <RouterLink to="/register">注册</RouterLink>
                    <RouterLink to="/">返回首页</RouterLink>
                </ElRow>
            </ElForm>
        </ElCard>
    </div>
    <ThemeSwitch class="theme-switch" />
</template>

<script lang="ts" setup>
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import { myAlert } from '@/lib/my-alert';
import { request } from '@/lib/request';
import { useTitle } from '@/lib/use-title';
import router from '@/router';
import { useSessionStore } from '@/stores/session';
import { sha256 } from 'common-lib/api-lib/sha256';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElRow, type FormInstance, type FormRules } from 'element-plus';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';

interface Form {
    name: string;
    password: string;
}

const form = reactive<Form>({
    name: '',
    password: '',
});

const sessionStore = useSessionStore();

const loginContainer = ref<HTMLDivElement>();

const setCardTop = () => {
    const card = loginContainer.value;
    if (!card) {
        myAlert.error('界面加载失败');
        return;
    }

    const cardHeight = card.offsetHeight;
    card.style.top = `calc(50vh - ${cardHeight / 2}px)`;
};

onMounted(() => {
    setCardTop();
    window.addEventListener('resize', setCardTop);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', setCardTop);
});

const rules = reactive<FormRules<Form>>({
    name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const formRef = ref<FormInstance>();

const handleLogin = async () => {
    const formInstance = formRef.value;
    if (!formInstance) {
        myAlert.error('表单未加载');
        return;
    }

    await formInstance.validate(async (valid, fields) => {
        if (!valid) {
            for (const field in fields) {
                const errors = fields[field];
                for (const error of errors) {
                    myAlert.error(error.message!);
                }
            }
            return;
        }

        try {
            const passwordHash = await sha256(form.password);
            const response = (
                await request('/user/login', {
                    name: form.name,
                    passwordHash,
                })
            ).data;

            if (response.success) {
                sessionStore.userName = form.name;
                sessionStore.passwordHash = passwordHash;
                sessionStore.sessionToken = response.sessionToken;
                sessionStore.loggedIn = true;

                myAlert.success.next('登录成功');
                await router.push({ path: '/' });
                return;
            }

            switch (response.reason) {
                case 'not_exists':
                    myAlert.error('登录失败：用户不存在');
                    break;
                case 'wrong_password':
                    myAlert.error('登录失败：密码错误');
                    break;
                case 'invalid':
                    myAlert.error('登录失败：账号未激活，请等待管理员审核');
                    break;
                default:
                    myAlert.error('登录失败：未知错误');
            }
        } catch (e) {
            myAlert.error('登录失败：网络错误');
        }
    });
};

useTitle('登录 | 哈希语词典');
</script>

<style lang="scss" scoped>
.login-container {
    position: fixed;
    left: calc(50vw - 240px);
}

.login-card {
    width: 480px;
}

.center-header {
    margin: 0;
    text-align: center;
}

.button-container {
    justify-content: center;

    a {
        color: var(--el-text-color-regular);
        margin: 0 2em;
        line-height: 28px;
    }
}

.theme-switch {
    position: fixed;
    top: 10px;
    right: 10px;
}
</style>

<style lang="scss">
.login-card-header {
    padding: 4px;
}
</style>
