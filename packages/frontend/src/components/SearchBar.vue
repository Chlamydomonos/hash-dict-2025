<template>
    <ElInput v-model="searchValue" size="small" class="search-bar">
        <template #append>
            <ElButton size="small" @click="search">
                <template #icon>
                    <Search class="search-icon" />
                </template>
            </ElButton>
        </template>
    </ElInput>
</template>

<script lang="ts" setup>
import router from '@/router';
import { Search } from '@element-plus/icons-vue';
import { ElButton, ElInput } from 'element-plus';
import { ref } from 'vue';

const searchValue = ref('');

const search = async () => {
    await router.push({ name: 'search', params: { word: searchValue.value } });
};
</script>

<style lang="scss" scoped>
.search-bar {
    --el-fill-color-light: rgba(0, 0, 0, 0);
}

*:hover > * > .search-icon {
    color: var(--el-button-hover-text-color);
}
</style>
