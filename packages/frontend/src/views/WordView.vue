<template>
    <div class="outer-frame">
        <div class="word-header">
            <ElScrollbar>
                <div class="chain-container">
                    <div class="type-container">
                        <ElLink @click="toType">{{ type.end == '' ? '_' : toFormat(type.end, format) }}</ElLink>
                    </div>
                    <div class="type-separator">/</div>
                    <template v-for="(category, id) in categories" v-bind:key="id">
                        <ElLink @click="toId(id)">{{ genCategory(category, id) }}</ElLink>
                        <div class="category-separator" v-if="id != categories.length - 1">/</div>
                    </template>
                </div>
            </ElScrollbar>
        </div>
        <div class="format-container">
            <ElFormItem label="格式:" class="format-selection">
                <ElSelect size="small" v-model="selectedFormat" @change="routeFormat">
                    <ElOption
                        v-for="format in formats"
                        v-bind:key="format"
                        :value="format"
                        :label="formatLabels[format]"
                    />
                </ElSelect>
            </ElFormItem>
            <ElPopconfirm title="确认删除？该单词的所有子类也会被删除" @confirm="handleDelete" :icon="WarningFilled">
                <template #reference>
                    <ElButton size="small" type="danger" v-if="loggedIn">
                        <template #icon><Delete /></template>
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
        <div class="word">{{ fullWord }}</div>
        <div class="titles-container">
            <div class="title">释义</div>
            <ElButton v-if="loggedIn" size="small" @click="toggleEdit">
                <template #icon>
                    <Edit v-if="!editing" />
                    <CircleCheck v-else />
                </template>
            </ElButton>
        </div>
        <div class="content-container">
            <ElSkeleton :throttle="300" :loading="descriptionLoading">
                <template #default>
                    <div v-if="descriptionLoading"></div>
                    <div class="error-text" v-else-if="description === undefined">Error</div>
                    <MarkdownComponent v-else-if="!editing" :text="description" />
                    <ElInput type="textarea" :rows="10" v-else v-model="editingText" />
                </template>
            </ElSkeleton>
        </div>
        <ElSkeleton :loading="embedLoading" :throttle="300" :rows="0">
            <div class="embed-info-container">
                <div :class="embedded ? ['embed-info-green'] : ['embed-info-red']">
                    {{ embedded ? '已向量化' : '未向量化' }}
                </div>
                <ElButton size="small" @click="embed" :disabled="embedding" v-if="!embedded && loggedIn">
                    向量化
                </ElButton>
            </div>
        </ElSkeleton>
        <div class="titles-container">
            <div class="title">子类</div>
            <ElButton v-if="loggedIn" size="small" @click="toCreate">
                <template #icon><Plus /></template>
            </ElButton>
        </div>
        <div class="content-container" v-if="pageCountLoading">
            <ElSkeleton :throttle="300" />
        </div>
        <template v-else>
            <PageComponent v-if="pageCount > 0" :page-count @page-change="loadPage">
                <div class="content-container">
                    <ElSkeleton :throttle="300" :loading="pageLoading">
                        <div class="page">
                            <div v-for="(item, id) in pageValue" v-bind:key="id" class="page-item">
                                <ElLink @click="toChild(item)">{{ buildChild(item.value) }}</ElLink>
                            </div>
                        </div>
                    </ElSkeleton>
                </div>
            </PageComponent>
            <div class="content-container" v-else-if="pageCount == 0">
                <ElEmpty description="暂无子类" />
            </div>
            <div class="content-container error-text" v-else>Error</div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import MarkdownComponent from '@/components/MarkdownComponent.vue';
import PageComponent from '@/components/PageComponent.vue';
import { buildWordParams } from '@/lib/build-word-params';
import { formatLabels } from '@/lib/format-labels';
import { myAlert } from '@/lib/my-alert';
import { request } from '@/lib/request';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useTitle } from '@/lib/use-title';
import router from '@/router';
import { useSessionStore } from '@/stores/session';
import { CircleCheck, Delete, Edit, Plus, WarningFilled, Close, Check } from '@element-plus/icons-vue';
import { formats, toFormat, WordFormat } from 'common-lib/word/index';
import {
    ElButton,
    ElEmpty,
    ElFormItem,
    ElInput,
    ElLink,
    ElOption,
    ElScrollbar,
    ElSelect,
    ElSkeleton,
    ElPopconfirm,
} from 'element-plus';
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps({
    format: {
        type: String as () => Exclude<WordFormat, WordFormat.DB>,
        required: true,
    },
    type: {
        type: {} as () => { id: number; end: string },
        required: true,
    },
    categories: {
        type: {} as () => { id: number; value: string }[],
        required: true,
    },
});

const selectedFormat = ref(props.format);

const routeFormat = async () => {
    await router.replace({
        name: 'word',
        params: buildWordParams({
            ...props,
            format: selectedFormat.value,
        }),
    });
};

const fullWord = computed(() => {
    let word = '';
    for (const category of props.categories) {
        word += category.value;
    }
    word += props.type.end;
    if (word.startsWith('b')) {
        word = word.slice(1);
    }
    return toFormat(word, props.format);
});

const toId = async (id: number) => {
    await router.push({
        name: 'word',
        params: buildWordParams({
            ...props,
            categories: props.categories.slice(0, id + 1),
        }),
    });
};

const { loggedIn } = storeToRefs(useSessionStore());

const descriptionLoading = ref(true);
const description = ref<string>();

const loadDescription = async () => {
    descriptionLoading.value = true;
    description.value = undefined;
    try {
        const lastCategory = props.categories[props.categories.length - 1];
        const response = (await request('/word/category', { id: lastCategory.id })).data;
        descriptionLoading.value = false;
        if (response.success) {
            description.value = response.description;
            return;
        } else {
            switch (response.reason) {
                case 'not_exists':
                    myAlert.error('加载释义失败：单词不存在');
                    return;
                default:
                    myAlert.error('加载释义失败：未知错误');
            }
        }
    } catch (e) {
        myAlert.error('加载释义失败：网络错误');
        descriptionLoading.value = false;
    }
};

const pageCountLoading = ref(true);
const pageCount = ref(-1);
const pageLoading = ref(true);
const pageValue = ref<{ id: number; value: string }[]>();

const loadPage = async (pageId: number) => {
    pageLoading.value = true;
    pageValue.value = undefined;
    try {
        const res = (
            await request('/word/list', {
                typeId: props.type.id,
                parentId: props.categories[props.categories.length - 1].id,
                start: (pageId - 1) * 20,
                limit: 20,
            })
        ).data;

        if (res.success) {
            pageLoading.value = false;
            pageValue.value = res.data;
        } else {
            pageCountLoading.value = false;
            pageCount.value = -1;
            switch (res.reason) {
                case 'type_not_exists':
                    myAlert.error('加载子类失败：类型不存在');
                    return;
                case 'parent_not_exists':
                    myAlert.error('加载子类失败：单词不存在');
                    return;
                default:
                    myAlert.error('加载子类失败：未知错误');
                    return;
            }
        }
    } catch (e) {
        pageCountLoading.value = false;
        pageCount.value = -1;
        myAlert.error('加载子类失败：网络错误');
    }
};

const loadPageCount = async () => {
    pageCountLoading.value = true;
    pageCount.value = -1;
    try {
        const res = (
            await request('/word/count', {
                typeId: props.type.id,
                parentId: props.categories[props.categories.length - 1].id,
            })
        ).data;

        pageCountLoading.value = false;

        if (!res.success) {
            pageCount.value = -1;
            switch (res.reason) {
                case 'type_not_exists':
                    myAlert.error('加载子类失败：类型不存在');
                    return;
                case 'parent_not_exists':
                    myAlert.error('加载子类失败：单词不存在');
                    return;
                default:
                    myAlert.error('加载子类失败：未知错误');
                    return;
            }
        }

        pageCount.value = Math.ceil(res.count / 20);
        await loadPage(1);
    } catch (e) {
        pageCountLoading.value = false;
        pageCount.value = -1;
        myAlert.error('加载子类失败：网络错误');
    }
};

const buildChild = (value: string) => {
    let word = '';
    for (const category of props.categories) {
        word += category.value;
    }
    word += value;
    word += props.type.end;
    if (word.startsWith('b')) {
        word = word.slice(1);
    }
    return toFormat(word, props.format);
};

const toChild = async (child: { id: number; value: string }) => {
    await router.push({
        name: 'word',
        params: buildWordParams({
            ...props,
            categories: [...props.categories, child],
        }),
    });
};

const toCreate = async () => {
    await router.push({
        name: 'create-category',
        params: buildWordParams(props),
    });
};

const editing = ref(false);
const editingText = ref('');

const toggleEdit = async () => {
    editing.value = !editing.value;
    if (editing.value) {
        editingText.value = description.value ?? '';
        return;
    }

    try {
        const response = (
            await loginRequest('/word/edit-category', {
                id: props.categories[props.categories.length - 1].id,
                description: editingText.value,
            })
        ).data;

        if (response.success) {
            myAlert.success('编辑成功');
            description.value = editingText.value;
            return;
        }

        switch (response.reason) {
            case 'not_exists':
                myAlert.error('编辑失败：单词不存在');
            default:
                myAlert.error('编辑失败：未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('编辑失败：未登录');
        } else {
            myAlert.error('编辑失败：网络错误');
        }
    }
};

const toType = async () => {
    await router.push({
        name: 'type',
        params: {
            typeId: props.type.id,
            type: props.type.end == '' ? '0' : props.type.end,
        },
    });
};

const handleDelete = async () => {
    try {
        const response = (
            await loginRequest('/word/delete-category', {
                id: props.categories[props.categories.length - 1].id,
            })
        ).data;

        if (response.success) {
            myAlert.success.next('删除成功');
            await router.replace('/');
            return;
        }

        myAlert.error('删除失败：未知错误');
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('删除单词失败：未登录');
        } else {
            myAlert.error('删除单词失败：网络错误');
        }
    }
};

useTitle(
    () => `${fullWord.value} | 哈希语词典`,
    () => [props.type.id, props.categories[props.categories.length - 1]?.id],
);

const genCategory = (category: { id: number; value: string }, id: number) => {
    let value = category.value;
    if (id == 0 && value.startsWith('b')) {
        value = value.slice(1);
    }
    return toFormat(value, props.format);
};

const embedLoading = ref(true);
const embedded = ref(false);
const embedding = ref(false);

const loadEmbedded = async () => {
    embedLoading.value = true;
    try {
        const response = (
            await request('/embedding/category', { id: props.categories[props.categories.length - 1].id })
        ).data;
        if (!response.success) {
            switch (response.reason) {
                case 'not_exists':
                    myAlert.error('加载向量化信息失败: 单词不存在');
                    return;
                default:
                    myAlert.error('加载向量化信息失败: 未知错误');
                    return;
            }
        }
        embedded.value = response.embedded;
        embedLoading.value = false;
    } catch (e) {
        myAlert.error('加载向量化信息失败: 网络错误');
    }
};

const embed = async () => {
    try {
        embedding.value = true;
        const response = (
            await loginRequest('/embedding/embed-word', { id: props.categories[props.categories.length - 1].id })
        ).data;
        embedding.value = false;
        if (response.success) {
            myAlert.success('向量化成功');
            embedded.value = true;
            return;
        } else {
            switch (response.reason) {
                case 'embed_all_in_progress':
                    myAlert.error('向量化失败: 其他向量化任务进行中');
                    return;
                case 'no_client':
                    myAlert.error('向量化失败: 没有可用的向量化客户端');
                    return;
                case 'not_exists':
                    myAlert.error('向量化失败: 单词不存在');
                    return;
                default:
                    myAlert.error('向量化失败: 未知错误');
            }
        }
    } catch (e) {
        embedding.value = false;
        if (e instanceof NotLoggedInError) {
            myAlert.error('向量化失败: 未登录');
        } else {
            myAlert.error('向量化失败: 网络错误');
        }
    }
};

onMounted(async () => {
    await Promise.all([loadDescription(), loadPageCount(), loadEmbedded()]);
});

watch(
    () => [props.type.id, props.categories[props.categories.length - 1]?.id],
    async () => {
        await Promise.all([loadDescription(), loadPageCount(), loadEmbedded()]);
    },
    { immediate: false },
);
</script>

<style lang="scss" scoped>
.outer-frame {
    width: min(calc(100vw - 8px), 800px);
    margin: 2em auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
}

.word-header {
    border-bottom: 1px solid var(--el-border-color);
    padding: 0.2em;
}

.chain-container {
    display: flex;
    width: fit-content;
}

.type-container {
    display: inline-flex;
    align-items: center;
    margin: 0.1em;
    padding: 0 0.2em;
    background-color: var(--el-color-info-light-7);
    border-radius: 2px;
    * {
        font-weight: bold;
    }
}

.type-separator {
    display: inline-flex;
    align-items: center;
    margin: 0 0.5em;
    font-weight: bold;
    color: var(--el-color-info);
}

.category-separator {
    display: inline-flex;
    align-items: center;
    margin: 0 0.2em;
}

.format-selection {
    padding: 0.25em;
    width: 200px;
}

.word {
    padding: 0.5em;
    font-size: large;
    font-weight: bold;
    text-align: center;
}

.titles-container {
    display: flex;
    align-items: center;
    margin: 0.25em 0;

    > * {
        margin: 0 0.25em;
    }

    .title {
        font-weight: bold;
    }
}

.content-container {
    padding: 1em;
}

.error-text {
    color: var(--el-color-error);
}

.page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5em;
}

.page-item {
    padding: 0.25em;
}

.format-container {
    display: flex;
    justify-content: space-between;

    > .el-button {
        margin: 0.25em;
    }
}

.embed-info-container {
    display: flex;
    padding: 4px;
    align-items: center;

    .embed-info-green {
        color: var(--el-color-success-light-3);
        font-size: small;
        margin-right: 1rem;
    }

    .embed-info-red {
        color: var(--el-color-danger-light-3);
        font-size: small;
        margin-right: 1rem;
    }
}
</style>
