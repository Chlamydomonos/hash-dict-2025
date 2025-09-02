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
    <div class="user-menu" ref="userMenu" :hidden="!showUserMenu">temp</div>
    <div>
        <RouterView />
    </div>
</template>

<script lang="ts" setup>
import SearchBar from '@/components/SearchBar.vue';
import ThemeSwitch from '@/components/ThemeSwitch.vue';
import { User } from '@element-plus/icons-vue';
import { ElLink } from 'element-plus';
import { onBeforeMount, onBeforeUnmount, onMounted, ref, watch } from 'vue';

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
}
</style>
