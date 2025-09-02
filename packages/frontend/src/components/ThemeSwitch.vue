<template>
    <ElSwitch class="theme-switch" v-model="isDark">
        <template #active-action>
            <ElIcon class="dark-icon"><Moon /></ElIcon>
        </template>
        <template #inactive-action>
            <ElIcon class="light-icon"><Sunny /></ElIcon>
        </template>
    </ElSwitch>
</template>

<script lang="ts" setup>
import { useThemeStore } from '@/stores/theme';
import { ElIcon, ElSwitch } from 'element-plus';
import { storeToRefs } from 'pinia';
import { Sunny, Moon } from '@element-plus/icons-vue';

const { isDark } = storeToRefs(useThemeStore());
</script>

<style lang="scss" scoped>
.light-icon {
    color: var(--el-text-color-primary);
}

.dark-icon {
    color: var(--el-bg-color);
}

.theme-switch {
    --el-switch-on-color: var(--el-color-info-light-5);
}
</style>
