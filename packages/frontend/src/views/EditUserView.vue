<template>
    <div class="outer-frame">
        <ElForm :model="form" :rules="rules" ref="formRef">
            <h1>编辑用户信息</h1>
            <ElFormItem prop="name" label="用户名：">
                <ElInput v-model="form.name" placeholder="请输入新用户名（留空表示不修改）" />
            </ElFormItem>
            <ElFormItem prop="password" label="新密码：">
                <ElInput
                    v-model="form.password"
                    type="password"
                    placeholder="请输入新密码（留空表示不修改）"
                    show-password
                />
            </ElFormItem>
            <ElFormItem prop="confirmPassword" label="确认密码：">
                <ElInput v-model="form.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
            </ElFormItem>
            <div>
                <ElButton @click="tryUpdate">保存修改</ElButton>
                <ElButton @click="router.back">取消</ElButton>
            </div>
        </ElForm>
    </div>
</template>

<script lang="ts" setup>
import { myAlert } from '@/lib/my-alert';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useTitle } from '@/lib/use-title';
import router from '@/router';
import { useSessionStore } from '@/stores/session';
import { sha256 } from 'common-lib/api-lib/sha256';
import { ElForm, ElFormItem, ElInput, ElButton, type FormInstance, type FormRules } from 'element-plus';
import { reactive, ref } from 'vue';

interface FormData {
    name: string;
    password: string;
    confirmPassword: string;
}

const form = reactive<FormData>({
    name: '',
    password: '',
    confirmPassword: '',
});

const validatePasswordConfirm = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (form.password && value !== form.password) {
        callback(new Error('两次输入的密码不一致'));
    } else {
        callback();
    }
};

const rules = reactive<FormRules<FormData>>({
    confirmPassword: [{ validator: validatePasswordConfirm, trigger: 'blur' }],
});

const formRef = ref<FormInstance>();
const sessionStore = useSessionStore();

const tryUpdate = async () => {
    const formInstance = formRef.value;
    if (!formInstance) {
        myAlert.error('表单未加载');
        return;
    }

    // 检查是否有任何修改
    if (!form.name.trim() && !form.password.trim()) {
        myAlert.error('请至少修改一项信息');
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
            const updateData: { name?: string; passwordHash?: string } = {};

            if (form.name.trim()) {
                updateData.name = form.name.trim();
            }

            if (updateData.name == sessionStore.userName) {
                updateData.name = undefined;
            }

            if (form.password.trim()) {
                updateData.passwordHash = await sha256(form.password);
            }

            const response = (await loginRequest('/user/edit', updateData)).data;

            if (response.success) {
                myAlert.success.next('用户信息修改成功');

                // 更新本地存储的用户信息
                if (updateData.name) {
                    sessionStore.userName = updateData.name;
                }
                if (updateData.passwordHash) {
                    sessionStore.passwordHash = updateData.passwordHash;
                }

                await router.replace({ name: 'home' });
                return;
            }

            switch (response.reason) {
                case 'exists':
                    myAlert.error('修改失败：用户名已存在');
                    return;
                default:
                    myAlert.error('修改失败：未知错误');
            }
        } catch (e) {
            if (e instanceof NotLoggedInError) {
                myAlert.error('修改失败：未登录');
            } else {
                myAlert.error('修改失败：网络错误');
            }
        }
    });
};

useTitle('编辑用户信息 | 哈希语词典');
</script>

<style lang="scss" scoped>
.outer-frame {
    width: min(calc(100vw - 8px - 2em), calc(800px - 2em));
    margin: 2em auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 1em;
}
</style>
