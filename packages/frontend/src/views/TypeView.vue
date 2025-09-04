<template>
    <div class="outer-frame">
        <div class="type-header">
            <div class="type-display">类型: {{ type.end == '' ? '_' : toFormat(type.end, format) }}</div>
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
            <ElPopconfirm title="确认删除？该类别的所有单词也会被删除" @confirm="handleDelete" :icon="WarningFilled">
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
        <div class="titles-container">
            <div class="title">描述</div>
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
                    <div class="error-text" v-if="description === undefined">Error</div>
                    <MarkdownComponent v-else-if="!editing" :text="description" />
                    <ElInput type="textarea" :rows="10" v-else v-model="editingText" />
                </template>
            </ElSkeleton>
        </div>
        <div class="titles-container">
            <div class="title">子类</div>
            <ElButton v-if="loggedIn" size="small" @click="toCreateCategory">
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
import { Check, CircleCheck, Close, Delete, Edit, Plus, WarningFilled } from '@element-plus/icons-vue';
import { formats, toFormat, WordFormat } from 'common-lib/word/index';
import {
    ElButton,
    ElEmpty,
    ElFormItem,
    ElInput,
    ElLink,
    ElOption,
    ElPopconfirm,
    ElSelect,
    ElSkeleton,
} from 'element-plus';
import { storeToRefs } from 'pinia';
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    format: {
        type: String as () => Exclude<WordFormat, WordFormat.DB>,
        required: true,
    },
    type: {
        type: {} as () => { id: number; end: string },
        required: true,
    },
});

const selectedFormat = ref(props.format);

const routeFormat = async () => {
    await router.replace({
        name: 'type',
        params: {
            format: selectedFormat.value,
            typeId: props.type.id,
            type: props.type.end == '' ? '0' : props.type.end,
        },
    });
};

const { loggedIn } = storeToRefs(useSessionStore());

const descriptionLoading = ref(true);
const description = ref<string>();

const loadDescription = async () => {
    descriptionLoading.value = true;
    description.value = undefined;
    try {
        const response = (await request('/word/type', { id: props.type.id })).data;
        descriptionLoading.value = false;
        if (response.success) {
            description.value = response.description;
            return;
        } else {
            switch (response.reason) {
                case 'not_exists':
                    myAlert.error('加载描述失败：类型不存在');
                    return;
                default:
                    myAlert.error('加载描述失败：未知错误');
            }
        }
    } catch (e) {
        myAlert.error('加载描述失败：网络错误');
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
                parentId: null,
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
                    myAlert.error('加载子类失败：父类不存在');
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
                parentId: null,
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
                    myAlert.error('加载子类失败：父类不存在');
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
    let word = value + props.type.end;
    if (word.startsWith('b')) {
        word = word.slice(1);
    }
    return toFormat(word, props.format);
};

const toChild = async (child: { id: number; value: string }) => {
    await router.push({
        name: 'word',
        params: buildWordParams({
            format: props.format,
            type: props.type,
            categories: [child],
        }),
    });
};

watch(
    () => props.type.id,
    async () => {
        await Promise.all([loadDescription(), loadPageCount()]);
    },
    { immediate: false },
);

onMounted(async () => {
    await Promise.all([loadDescription(), loadPageCount()]);
});

const toCreateCategory = async () => {
    await router.push({
        name: 'create-category',
        params: {
            format: props.format,
            typeId: props.type.id,
            type: props.type.end == '' ? '0' : props.type.end,
        },
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
            await loginRequest('/word/edit-type', {
                id: props.type.id,
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
                myAlert.error('编辑失败：类型不存在');
                break;
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

const handleDelete = async () => {
    try {
        const response = (
            await loginRequest('/word/delete-type', {
                id: props.type.id,
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
            myAlert.error('删除类型失败：未登录');
        } else {
            myAlert.error('删除类型失败：网络错误');
        }
    }
};

useTitle(
    () => `类别：${props.type.end == '' ? '_' : toFormat(props.type.end, props.format)} | 哈希语词典`,
    () => props.type.id,
);
</script>

<style lang="scss" scoped>
.outer-frame {
    width: min(calc(100vw - 8px), 800px);
    margin: 2em auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
}

.type-header {
    border-bottom: 1px solid var(--el-border-color);
    padding: 1em;
}

.type-display {
    font-size: large;
    font-weight: bold;
    text-align: center;
}

.format-selection {
    padding: 0.25em;
    width: 200px;
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
</style>
