<template>
    <div class="outer-frame">
        <div class="admin-header">
            <div class="admin-title">用户管理</div>
        </div>
        <div class="filter-container">
            <ElFormItem label="过滤器:" class="filter-selection">
                <ElSelect size="small" v-model="selectedFilter" @change="loadPageCount">
                    <ElOption value="" label="无过滤器" />
                    <ElOption value="valid" label="仅显示有效用户" />
                    <ElOption value="invalid" label="仅显示无效用户" />
                </ElSelect>
            </ElFormItem>
            <div class="batch-actions" v-if="loggedIn && selectedUsers.length > 0">
                <ElButton size="small" type="primary" @click="batchValidate" :disabled="batchValidateDisabled">
                    <template #icon><CircleCheck /></template>
                    批量启用 ({{ selectedUsers.length }})
                </ElButton>
                <ElPopconfirm
                    :title="`确认删除选中的 ${selectedUsers.length} 个用户？`"
                    @confirm="batchDelete"
                    :icon="WarningFilled"
                >
                    <template #reference>
                        <ElButton size="small" type="danger">
                            <template #icon><Delete /></template>
                            批量删除 ({{ selectedUsers.length }})
                        </ElButton>
                    </template>
                    <template #actions="{ confirm, cancel }">
                        <ElButton size="small" @click="cancel">
                            <template #icon><Close /></template>
                        </ElButton>
                        <ElButton size="small" type="danger" @click="confirm">
                            <template #icon><Check /></template>
                        </ElButton>
                    </template>
                </ElPopconfirm>
            </div>
        </div>
        <div class="content-container" v-if="pageCountLoading">
            <ElSkeleton :throttle="300" />
        </div>
        <template v-else>
            <PageComponent v-if="pageCount > 0" :page-count @page-change="loadPage">
                <div class="content-container">
                    <ElSkeleton :throttle="300" :loading="pageLoading">
                        <div class="users-header" v-if="loggedIn">
                            <ElCheckbox
                                :model-value="isAllSelected"
                                :indeterminate="isIndeterminate"
                                @change="(val: any) => toggleSelectAll(!!val)"
                            >
                                全选
                            </ElCheckbox>
                        </div>
                        <div class="users-list">
                            <div v-for="user in pageValue" :key="user.id" class="user-item">
                                <div class="user-info">
                                    <ElCheckbox
                                        v-if="loggedIn"
                                        :model-value="selectedUsers.includes(user.id)"
                                        @change="(val: any) => toggleSelectUser(user.id)"
                                        class="user-checkbox"
                                    />
                                    <div class="user-details">
                                        <div class="user-name">{{ user.name }}</div>
                                        <div class="user-status" :class="{ valid: user.valid, invalid: !user.valid }">
                                            {{ user.valid ? '有效' : '无效' }}
                                        </div>
                                    </div>
                                </div>
                                <div class="user-actions" v-if="loggedIn">
                                    <ElButton
                                        v-if="!user.valid"
                                        size="small"
                                        type="primary"
                                        @click="validateUser(user.id)"
                                    >
                                        <template #icon><CircleCheck /></template>
                                        启用
                                    </ElButton>
                                    <ElPopconfirm
                                        :title="`确认删除用户 ${user.name}？`"
                                        @confirm="deleteUser(user.name)"
                                        :icon="WarningFilled"
                                    >
                                        <template #reference>
                                            <ElButton size="small" type="danger">
                                                <template #icon><Delete /></template>
                                                删除
                                            </ElButton>
                                        </template>
                                        <template #actions="{ confirm, cancel }">
                                            <ElButton size="small" @click="cancel">
                                                <template #icon><Close /></template>
                                            </ElButton>
                                            <ElButton size="small" type="danger" @click="confirm">
                                                <template #icon><Check /></template>
                                            </ElButton>
                                        </template>
                                    </ElPopconfirm>
                                </div>
                            </div>
                        </div>
                    </ElSkeleton>
                </div>
            </PageComponent>
            <div class="content-container" v-else-if="pageCount == 0">
                <ElEmpty description="暂无用户" />
            </div>
            <div class="content-container error-text" v-else>Error</div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import PageComponent from '@/components/PageComponent.vue';
import { myAlert } from '@/lib/my-alert';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useTitle } from '@/lib/use-title';
import { useSessionStore } from '@/stores/session';
import { Check, CircleCheck, Close, Delete, WarningFilled } from '@element-plus/icons-vue';
import { ElButton, ElCheckbox, ElEmpty, ElFormItem, ElOption, ElPopconfirm, ElSelect, ElSkeleton } from 'element-plus';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';

const { loggedIn } = storeToRefs(useSessionStore());

const selectedFilter = ref<'' | 'valid' | 'invalid'>('');
const selectedUsers = ref<number[]>([]);

const pageCountLoading = ref(true);
const pageCount = ref(-1);
const pageLoading = ref(true);
const pageValue = ref<{ id: number; name: string; valid: boolean }[]>([]);

const loadPage = async (pageId: number) => {
    pageLoading.value = true;
    pageValue.value = [];
    selectedUsers.value = [];

    try {
        const res = (
            await loginRequest('/user/list', {
                start: (pageId - 1) * 20,
                limit: 20,
                filter: selectedFilter.value || undefined,
            })
        ).data;

        if (res.success) {
            pageLoading.value = false;
            pageValue.value = res.data;
        } else {
            pageCountLoading.value = false;
            pageCount.value = -1;
            myAlert.error('加载用户列表失败：未知错误');
        }
    } catch (e) {
        pageCountLoading.value = false;
        pageCount.value = -1;
        if (e instanceof NotLoggedInError) {
            myAlert.error('加载用户列表失败：未登录');
        } else {
            myAlert.error('加载用户列表失败：网络错误');
        }
    }
};

const loadPageCount = async () => {
    pageCountLoading.value = true;
    pageCount.value = -1;
    selectedUsers.value = [];

    try {
        const res = (
            await loginRequest('/user/count', {
                filter: selectedFilter.value || undefined,
            })
        ).data;

        pageCountLoading.value = false;

        if (!res.success) {
            pageCount.value = -1;
            myAlert.error('加载用户数量失败：未知错误');
            return;
        }

        pageCount.value = Math.ceil(res.count / 20);
        await loadPage(1);
    } catch (e) {
        pageCountLoading.value = false;
        pageCount.value = -1;
        if (e instanceof NotLoggedInError) {
            myAlert.error('加载用户数量失败：未登录');
        } else {
            myAlert.error('加载用户数量失败：网络错误');
        }
    }
};

const validateUser = async (userId: number) => {
    try {
        const response = (
            await loginRequest('/user/validate', {
                ids: [userId],
            })
        ).data;

        if (response.success) {
            myAlert.success('用户启用成功');
            await loadPageCount();
        } else {
            switch (response.reason) {
                case 'not_exists':
                    myAlert.error('启用失败：用户不存在');
                    break;
                default:
                    myAlert.error('启用失败：未知错误');
            }
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('启用失败：未登录');
        } else {
            myAlert.error('启用失败：网络错误');
        }
    }
};

const deleteUser = async (userName: string) => {
    try {
        const response = (
            await loginRequest('/user/delete', {
                names: [userName],
            })
        ).data;

        if (response.success) {
            myAlert.success('用户删除成功');
            await loadPageCount();
        } else {
            myAlert.error('删除失败：未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('删除失败：未登录');
        } else {
            myAlert.error('删除失败：网络错误');
        }
    }
};

const toggleSelectUser = (userId: number) => {
    const index = selectedUsers.value.indexOf(userId);
    if (index > -1) {
        selectedUsers.value.splice(index, 1);
    } else {
        selectedUsers.value.push(userId);
    }
};

const isAllSelected = computed(() => {
    return pageValue.value.length > 0 && selectedUsers.value.length === pageValue.value.length;
});

const isIndeterminate = computed(() => {
    return selectedUsers.value.length > 0 && selectedUsers.value.length < pageValue.value.length;
});

const batchValidateDisabled = computed(() => {
    return selectedUsers.value.every((id) => {
        const user = pageValue.value.find((u) => u.id === id);
        return user?.valid === true;
    });
});

const toggleSelectAll = (checked: boolean) => {
    if (checked) {
        selectedUsers.value = pageValue.value.map((user) => user.id);
    } else {
        selectedUsers.value = [];
    }
};

const batchValidate = async () => {
    const invalidUserIds = selectedUsers.value.filter((id) => {
        const user = pageValue.value.find((u) => u.id === id);
        return user?.valid === false;
    });

    if (invalidUserIds.length === 0) {
        myAlert.warning('没有需要启用的用户');
        return;
    }

    try {
        const response = (
            await loginRequest('/user/validate', {
                ids: invalidUserIds,
            })
        ).data;

        if (response.success) {
            myAlert.success(`批量启用成功，共启用 ${invalidUserIds.length} 个用户`);
            selectedUsers.value = [];
            await loadPageCount();
        } else {
            switch (response.reason) {
                case 'not_exists':
                    myAlert.error('批量启用失败：部分用户不存在');
                    break;
                default:
                    myAlert.error('批量启用失败：未知错误');
            }
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('批量启用失败：未登录');
        } else {
            myAlert.error('批量启用失败：网络错误');
        }
    }
};

const batchDelete = async () => {
    const userNames = selectedUsers.value
        .map((id) => {
            const user = pageValue.value.find((u) => u.id === id);
            return user?.name;
        })
        .filter((name) => name !== undefined) as string[];

    if (userNames.length === 0) {
        myAlert.warning('没有选中的用户');
        return;
    }

    try {
        const response = (
            await loginRequest('/user/delete', {
                names: userNames,
            })
        ).data;

        if (response.success) {
            myAlert.success(`批量删除成功，共删除 ${userNames.length} 个用户`);
            selectedUsers.value = [];
            await loadPageCount();
        } else {
            myAlert.error('批量删除失败：未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('批量删除失败：未登录');
        } else {
            myAlert.error('批量删除失败：网络错误');
        }
    }
};

onMounted(async () => {
    await loadPageCount();
});

useTitle('管理员界面 | 哈希语词典');
</script>

<style lang="scss" scoped>
.outer-frame {
    width: min(calc(100vw - 8px), 800px);
    margin: 2em auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
}

.admin-header {
    border-bottom: 1px solid var(--el-border-color);
    padding: 1em;
}

.admin-title {
    font-size: large;
    font-weight: bold;
    text-align: center;
}

.filter-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 0.25em;
    border-bottom: 1px solid var(--el-border-color);
}

.filter-selection {
    width: 200px;
    margin: 0;
}

.batch-actions {
    display: flex;
    gap: 0.5em;
    align-items: center;
}

.content-container {
    padding: 1em;
}

.users-header {
    padding: 0.5em 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 0.5em;
}

.users-list {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
}

.user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75em;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    background-color: var(--el-bg-color-page);

    &:hover {
        background-color: var(--el-bg-color);
    }
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1em;
    flex: 1;
}

.user-checkbox {
    flex-shrink: 0;
}

.user-details {
    display: flex;
    flex-direction: column;
    gap: 0.25em;
}

.user-name {
    font-weight: 500;
    font-size: 1em;
}

.user-status {
    font-size: 0.85em;
    padding: 0.125em 0.5em;
    border-radius: 12px;
    display: inline-block;
    width: fit-content;

    &.valid {
        background-color: var(--el-color-success-light-9);
        color: var(--el-color-success);
    }

    &.invalid {
        background-color: var(--el-color-warning-light-9);
        color: var(--el-color-warning);
    }
}

.user-actions {
    display: flex;
    gap: 0.5em;
    flex-shrink: 0;
}

.error-text {
    color: var(--el-color-error);
    text-align: center;
}

@media (max-width: 768px) {
    .filter-container {
        flex-direction: column;
        gap: 0.5em;
        align-items: stretch;
    }

    .batch-actions {
        justify-content: center;
    }

    .user-item {
        flex-direction: column;
        gap: 0.5em;
        align-items: stretch;
    }

    .user-info {
        justify-content: flex-start;
    }

    .user-actions {
        justify-content: center;
    }
}
</style>
