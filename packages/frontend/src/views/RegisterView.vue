<template>
    <div class="register-container" ref="registerContainer">
        <ElCard class="register-card" header-class="register-card-header">
            <template #header>
                <h1 class="center-header">注册</h1>
            </template>
            <ElForm label-width="auto" :rules="rules" :model="form" ref="formRef">
                <ElFormItem label="用户名" prop="name">
                    <ElInput v-model="form.name" />
                </ElFormItem>
                <ElFormItem label="密码" prop="password">
                    <ElInput v-model="form.password" show-password />
                </ElFormItem>
                <ElFormItem label="确认密码" prop="confirmPassword">
                    <ElInput v-model="form.confirmPassword" show-password />
                </ElFormItem>
                <ElRow class="button-container">
                    <ElButton @click="handleRegister">注册</ElButton>
                    <RouterLink to="/login">登录</RouterLink>
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
import { sha256 } from 'common-lib/api-lib/sha256';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElRow, type FormInstance, type FormRules } from 'element-plus';
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue';

interface Form {
    name: string;
    password: string;
    confirmPassword: string;
}

const form = reactive<Form>({
    name: '',
    password: '',
    confirmPassword: '',
});

const registerContainer = ref<HTMLDivElement>();

const setCardTop = () => {
    const card = registerContainer.value;
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
    name: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度应该在3-20之间', trigger: 'blur' },
        {
            validator: (_rule, value: string, callback) => {
                if (!/^[A-Za-z0-9_]*$/.test(value)) {
                    return callback('用户名只能由字母、数字和下划线组成');
                }
                return callback();
            },
            trigger: 'blur',
        },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 32, message: '密码长度应该在6-32之间', trigger: 'blur' },
        {
            validator: (_rule, value: string, callback) => {
                if (!/^[!-~]*$/.test(value)) {
                    return callback('密码只能由字母、数字和ASCII符号组成');
                }
                return callback();
            },
            trigger: 'blur',
        },
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (_rule, value: string, callback) => {
                if (value != form.password) {
                    return callback('两次输入的密码不一致');
                }
                return callback();
            },
            trigger: 'blur',
        },
    ],
});

const formRef = ref<FormInstance>();

const handleRegister = async () => {
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
                await request('/user/register', {
                    name: form.name,
                    passwordHash,
                })
            ).data;

            if (response.success) {
                myAlert.success.next('注册成功，请等待管理员审核账号');
                await router.push('/login');
                return;
            }

            switch (response.reason) {
                case 'exists':
                    myAlert.error('注册失败：用户已存在');
                default:
                    myAlert.error('注册失败：未知错误');
            }
        } catch (e) {
            myAlert.error('注册失败：网络错误');
        }
    });
};

useTitle('注册 | 哈希语词典');
</script>

<style lang="scss" scoped>
.register-container {
    position: fixed;
    left: calc(50vw - 240px);
}

.register-card {
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
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>

<style lang="scss">
.register-card-header {
    padding: 4px;
}
</style>
