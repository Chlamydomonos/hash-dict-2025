<template>
    <div class="search-container">
        <div class="loading-spinner"></div>
        <div class="search-text">正在搜索: {{ word }}</div>
    </div>
</template>

<script lang="ts" setup>
import { myAlert } from '@/lib/my-alert';
import { request } from '@/lib/request';
import router from '@/router';
import { useThemeStore } from '@/stores/theme';
import { checkFormat, toDB } from 'common-lib/word/index';
import { onMounted } from 'vue';

useThemeStore();

const props = defineProps({
    word: {
        type: String,
        required: true,
    },
});

onMounted(async () => {
    try {
        const format = checkFormat(props.word);
        const response = (
            await request('/word/find', {
                word: toDB(props.word),
            })
        ).data;
        if (response.success) {
            const { type, categories } = response;
            await router.replace({
                name: 'word',
                params: {
                    format,
                    typeId: type.id,
                    type: type.end == '' ? '0' : type.end,
                    categories: categories.flatMap((c) => [c.id.toString(), c.value]),
                },
            });
        } else {
            switch (response.reason) {
                case 'illegal':
                    myAlert.warning.next('搜索失败：非法单词');
                    router.back();
                    return;
                case 'not_exists':
                    myAlert.warning.next('搜索失败：单词不存在');
                    router.back();
                    return;
                default:
                    myAlert.error.next('搜索失败：未知错误');
                    router.back();
            }
        }
    } catch (e) {
        myAlert.error('搜索失败：网络错误');
        router.back();
    }
});
</script>

<style lang="scss" scoped>
.search-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
    padding: 2rem;
    text-align: center;
}

.loading-spinner {
    width: 72px;
    height: 72px;
    border: 8px solid var(--el-color-info);
    border-top: 8px solid var(--el-text-color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 2rem;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

.search-text {
    font-size: clamp(1.2rem, 4vw, 2rem);
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word;
    max-width: 90vw;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .search-container {
        min-height: 50vh;
        padding: 1.5rem;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        margin-bottom: 1.5rem;
    }
}

@media (max-width: 480px) {
    .search-container {
        padding: 1rem;
    }

    .loading-spinner {
        width: 36px;
        height: 36px;
        margin-bottom: 1rem;
    }
}
</style>
