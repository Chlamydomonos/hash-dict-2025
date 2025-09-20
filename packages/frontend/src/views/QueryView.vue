<template>
    <div class="search-container" v-if="!searchFinished">
        <div class="loading-spinner"></div>
        <div class="search-text">正在搜索: {{ text }}</div>
    </div>
    <div class="results-container" v-else>
        <div class="search-header">
            <div class="search-title">搜索结果: {{ text }}</div>
            <div class="format-selection">
                <ElFormItem label="格式:">
                    <ElSelect size="small" v-model="selectedFormat" @change="updateFormat">
                        <ElOption
                            v-for="format in formats"
                            :key="format"
                            :label="formatLabels[format]"
                            :value="format"
                        />
                    </ElSelect>
                </ElFormItem>
            </div>
        </div>
        <div class="content-container" v-if="searchError">
            <div class="error-text">{{ searchError }}</div>
        </div>
        <div class="content-container" v-else-if="searchResults.length === 0">
            <ElEmpty description="未找到相关结果" />
        </div>
        <div class="content-container" v-else>
            <div class="results-list">
                <div
                    class="result-item"
                    v-for="result in searchResults"
                    :key="`${result.type.id}-${result.data[result.data.length - 1].id}`"
                    @click="toWord(result)"
                >
                    <div class="word-text">{{ formatWord(result) }}</div>
                    <div class="word-type">{{ result.type.end || '_' }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useTitle } from '@/lib/use-title';
import { buildWordParams } from '@/lib/build-word-params';
import { formatLabels } from '@/lib/format-labels';
import router from '@/router';
import { formats, toFormat, WordFormat } from 'common-lib/word/index';
import { ElFormItem, ElSelect, ElOption, ElEmpty } from 'element-plus';
import { onMounted, ref } from 'vue';

const props = defineProps({
    text: {
        type: String,
        required: true,
    },
});

const searchFinished = ref(false);
const searchError = ref<string>();
const searchResults = ref<Array<{ type: { id: number; end: string }; data: { id: number; value: string }[] }>>([]);
const selectedFormat = ref<Exclude<WordFormat, WordFormat.DB>>(WordFormat.ASCII);

const updateFormat = () => {
    // 格式变化时不需要重新搜索，只需要重新渲染
};

const formatWord = (result: { type: { id: number; end: string }; data: { id: number; value: string }[] }) => {
    let word = '';
    for (const category of result.data) {
        word += category.value;
    }
    word += result.type.end;
    if (word.startsWith('b')) {
        word = word.slice(1);
    }
    return toFormat(word, selectedFormat.value);
};

const toWord = async (result: { type: { id: number; end: string }; data: { id: number; value: string }[] }) => {
    await router.push({
        name: 'word',
        params: buildWordParams({
            format: selectedFormat.value,
            type: result.type,
            categories: result.data,
        }),
    });
};

onMounted(async () => {
    try {
        const response = (await loginRequest('/embedding/query', { text: props.text })).data;
        searchFinished.value = true;

        if (response.success) {
            searchResults.value = response.data;
        } else {
            switch (response.reason) {
                case 'embedding':
                    searchError.value = '向量搜索失败：向量化任务进行中';
                    break;
                case 'no_client':
                    searchError.value = '向量搜索失败：您没有已连接的向量化客户端';
                    break;
                default:
                    searchError.value = '向量搜索失败：未知错误';
            }
        }
    } catch (e) {
        searchFinished.value = true;
        if (e instanceof NotLoggedInError) {
            searchError.value = '向量搜索失败：未登录';
        } else {
            searchError.value = '向量搜索失败：网络错误';
        }
    }
});

useTitle(() => `向量搜索：${props.text} | 哈希语词典`);
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

.results-container {
    width: min(calc(100vw - 8px), 800px);
    margin: 2em auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
}

.search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid var(--el-border-color);
    flex-wrap: wrap;
    gap: 1rem;
}

.search-title {
    font-size: 1.2rem;
    font-weight: bold;
    word-break: break-word;
    flex: 1;
    min-width: 200px;
}

.format-selection {
    width: 200px;
    min-width: 200px;

    .el-form-item {
        margin-bottom: 0;
    }
}

.content-container {
    padding: 1em;
}

.error-text {
    color: var(--el-color-error);
    text-align: center;
    font-size: 1.1rem;
}

.results-list {
    display: grid;
    gap: 0.5rem;
}

.result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background-color: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary-light-3);
    }
}

.word-text {
    font-size: 1.1rem;
    font-weight: 500;
    flex: 1;
    word-break: break-word;
}

.word-type {
    font-size: 0.9rem;
    color: var(--el-text-color-secondary);
    margin-left: 1rem;
    white-space: nowrap;
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

    .search-header {
        flex-direction: column;
        align-items: stretch;
    }

    .search-title {
        text-align: center;
        min-width: auto;
    }

    .format-selection {
        width: 100%;
        min-width: auto;
    }

    .result-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .word-type {
        margin-left: 0;
        align-self: flex-end;
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

    .results-container {
        margin: 1em auto;
    }

    .search-header {
        padding: 0.75rem;
    }

    .search-title {
        font-size: 1rem;
    }
}
</style>
