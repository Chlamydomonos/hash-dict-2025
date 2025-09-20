<template>
    <div class="site-header" ref="siteHeader">
        <h1 class="header-title">
            <RouterLink to="/">Haʃø</RouterLink>
        </h1>
        <div>
            <SearchBar />
            <ThemeSwitch />
            <ElLink class="user-link" underline="never" :icon="User" @click="showUserMenu = !showUserMenu" />
        </div>
    </div>
    <div class="user-menu" ref="userMenu" :hidden="!showUserMenu">
        <template v-if="loggedIn">
            <div>
                <ElIcon><User /></ElIcon>
                &nbsp;
                {{ userName }}
            </div>
            <div><RouterLink to="/edit-user">编辑用户信息</RouterLink></div>
            <div><RouterLink to="/admin">管理员页面</RouterLink></div>
            <div><RouterLink to="/embedding">向量化控制面板</RouterLink></div>
            <div><ElLink @click="logout" underline="never">登出</ElLink></div>
        </template>
        <template v-else>
            <div>未登录</div>
            <div><RouterLink to="/login">登录</RouterLink></div>
            <div><RouterLink to="/register">注册</RouterLink></div>
        </template>
    </div>
    <div>
        <RouterView @vue:updated="showUserMenu = false" />
    </div>
</template>

<script lang="ts" setup>
import SearchBar from '@/components/SearchBar.vue';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import { myAlert } from '@/lib/my-alert';
import { request } from '@/lib/request';
import router from '@/router';
import { useSessionStore } from '@/stores/session';
import { User } from '@element-plus/icons-vue';
import { ElIcon, ElLink } from 'element-plus';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const showUserMenu = ref(false);

const userMenu = ref<HTMLDivElement>();
const siteHeader = ref<HTMLDivElement>();

const placeSiteHeader = () => {
    if (userMenu.value && siteHeader.value) {
        userMenu.value.style.top = `${siteHeader.value.offsetHeight + 4}px`;
    }
};

watch(showUserMenu, (value) => {
    if (value) {
        placeSiteHeader();
    }
});

const resizeObserver = new ResizeObserver(placeSiteHeader);

onMounted(() => {
    if (siteHeader.value) {
        resizeObserver.observe(siteHeader.value);
    }
});

onBeforeUnmount(() => {
    if (siteHeader.value) {
        resizeObserver.unobserve(siteHeader.value);
    }
});

const { loggedIn, userName, passwordHash, sessionToken } = storeToRefs(useSessionStore());

const logout = async () => {
    if (!sessionToken.value) {
        return;
    }

    try {
        const response = (await request('/user/logout', { sessionToken: sessionToken.value })).data;
        if (response.success) {
            loggedIn.value = false;
            userName.value = undefined;
            passwordHash.value = undefined;
            sessionToken.value = undefined;
            myAlert.success('登出成功');
        } else {
            myAlert.error('登出失败：未知错误');
        }
    } catch (e) {
        myAlert.error('登出失败：网络错误');
    }
};

watch(router.currentRoute, () => {
    showUserMenu.value = false;
});
</script>

<style lang="scss" scoped>
.site-header {
    display: flex;
    position: sticky;
    border-bottom: 1px solid var(--el-border-color);
    justify-content: space-between;
    > div {
        display: flex;
        align-items: center;
        > *:not(:last-child) {
            margin: 0 4px;
        }

        > *:last-child {
            margin-left: 4px;
            margin-right: 8px;
        }
    }
}

.header-title {
    margin: 0;
    padding: 6px 12px;
    border-right: 1px solid var(--el-border-color);
    a {
        color: var(--el-text-color-regular);
        text-decoration: none;

        &:hover {
            color: var(--el-text-color-primary);
        }
    }
}

.user-link {
    font-size: 16px;
}

.user-menu {
    position: fixed;
    z-index: 100;
    right: 4px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    background-color: var(--el-bg-color);

    > div {
        padding: 4px;
        &:not(:last-child) {
            border-bottom: 1px solid var(--el-border-color);
        }

        a {
            color: var(--el-text-color-regular);
            font-size: var(--el-font-size-base);
            text-decoration: none;

            &:hover {
                color: var(--el-text-color-primary);
            }
        }
    }
}
</style>
