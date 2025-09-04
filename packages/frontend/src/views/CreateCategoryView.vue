<template>
    <div class="outer-frame">
        <ElFormItem label="格式:" class="format-selection">
            <ElSelect size="small" v-model="selectedFormat" @change="routeFormat">
                <ElOption v-for="format in formats" v-bind:key="format" :value="format" :label="formatLabels[format]" />
            </ElSelect>
        </ElFormItem>
        <ElForm :model="form" :rules ref="formRef">
            <h1>创建单词</h1>
            <ElFormItem prop="creatingValue">
                <ElInput v-model="form.creatingValue">
                    <template #prefix>{{ prefix }}</template>
                    <template #suffix>{{ toFormat(type.end, format) }}</template>
                </ElInput>
            </ElFormItem>
            <h3>或者从字符串生成哈希值：</h3>
            <div class="hash-button-container">
                <ElInput v-model="stringToHash" @keyup.enter="tryHash" />
                <ElButton @click="tryHash">哈希</ElButton>
            </div>
            <h3>输入释义：</h3>
            <ElFormItem prop="description">
                <ElInput v-model="form.description" type="textarea" :rows="10" />
            </ElFormItem>
            <div>
                <ElButton @click="tryCreate">创建</ElButton>
                <ElButton @click="router.back">取消</ElButton>
            </div>
        </ElForm>
    </div>
</template>

<script lang="ts" setup>
import { buildWordParams } from '@/lib/build-word-params';
import { formatLabels } from '@/lib/format-labels';
import { myAlert } from '@/lib/my-alert';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useTitle } from '@/lib/use-title';
import router from '@/router';
import { formats, toDB, toFormat, WordFormat } from 'common-lib/word/index';
import {
    ElButton,
    ElInput,
    ElFormItem,
    ElSelect,
    ElOption,
    ElForm,
    type FormRules,
    type FormInstance,
} from 'element-plus';
import { computed, reactive, ref } from 'vue';

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
    form.creatingValue = toFormat(toDB(form.creatingValue), selectedFormat.value);

    await router.replace({
        name: 'create-category',
        params: buildWordParams({
            ...props,
            format: selectedFormat.value,
        }),
    });
};

const prefix = computed(() => {
    let word = '';
    for (const category of props.categories) {
        word += category.value;
    }

    if (word.startsWith('b')) {
        word = word.slice(1);
    }

    return toFormat(word, props.format);
});

interface FormValue {
    creatingValue: string;
    description: string;
}

const form = reactive<FormValue>({
    creatingValue: '',
    description: '',
});

const stringToHash = ref('');

const tryHash = async () => {
    if (stringToHash.value == '') {
        return;
    }

    try {
        const response = (
            await loginRequest('/word/hash-string', {
                typeId: props.type.id,
                parentId: props.categories.length == 0 ? null : props.categories[props.categories.length - 1].id,
                original: stringToHash.value,
            })
        ).data;

        if (response.success) {
            form.creatingValue = toFormat(response.value, props.format);
            return;
        }

        switch (response.reason) {
            case 'type_not_exists':
                myAlert.error('生成哈希值失败：类别不存在');
            case 'parent_not_exists':
                myAlert.error('生成哈希值失败：父单词不存在');
            case 'hash_full':
                myAlert.error('生成哈希值失败：哈希域已满');
            default:
                myAlert.error('生成哈希值失败：未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('生成哈希值失败：未登录');
        } else {
            myAlert.error('生成哈希值失败：网络错误');
        }
    }
};

const rules = reactive<FormRules<FormValue>>({
    creatingValue: [{ required: true, message: '请输入哈希值', trigger: 'blur' }],
    description: [{ required: true, message: '请输入释义', trigger: 'blur' }],
});

const formRef = ref<FormInstance>();

const tryCreate = async () => {
    const formInstance = formRef.value;
    if (!formInstance) {
        myAlert.error('表单未加载');
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
            const dbValue = toDB(form.creatingValue);

            const response = (
                await loginRequest('/word/create-category', {
                    typeId: props.type.id,
                    parentId: props.categories.length == 0 ? null : props.categories[props.categories.length - 1].id,
                    value: dbValue,
                    description: form.description,
                })
            ).data;

            if (response.success) {
                myAlert.success.next('创建成功');
                await router.replace({
                    name: 'word',
                    params: buildWordParams({
                        ...props,
                        categories: [...props.categories, { id: response.id, value: dbValue }],
                    }),
                });
                return;
            }

            switch (response.reason) {
                case 'illegal':
                    myAlert.error('创建单词失败：非法格式');
                    return;
                case 'illegal_reserved':
                    myAlert.error('创建单词失败：含有保留字');
                    return;
                case 'parent_not_exists':
                    myAlert.error('创建单词失败：父单词不存在');
                    return;
                case 'prefix':
                    myAlert.error.html(`
                        <div>创建单词失败：单词是以下单词的前缀或前缀是以下单词：<div>
                        <ul>
                        ${response.prefixes
                            .map((value) => {
                                let word = '';
                                for (const category of props.categories) {
                                    word += category.value;
                                }
                                word += value;
                                word += props.type.end;
                                if (word.startsWith('b')) {
                                    word = word.slice(1);
                                }
                                return `${toFormat(word, props.format)}&nbsp;(${toFormat(value, props.format)})`;
                            })
                            .join('\n')}
                        </ul>
                    `);
                    return;
                case 'reserved':
                    myAlert.error.html(`
                        <div>创建单词失败：单词不符合保留字规则</div>
                        <div>符合规则的单词：${(() => {
                            let word = '';
                            for (const category of props.categories) {
                                word += category.value;
                            }
                            word += response.nextReserved;
                            word += props.type.end;
                            if (word.startsWith('b')) {
                                word = word.slice(1);
                            }
                            return `${toFormat(word, props.format)}&nbsp;(${toFormat(response.nextReserved, props.format)})`;
                        })()}</div>
                    `);
                    return;
                case 'type_not_exists':
                    myAlert.error('创建单词失败：类别不存在');
                    return;
                default:
                    myAlert.error('创建单词失败：未知错误');
            }
        } catch (e) {
            if (e instanceof NotLoggedInError) {
                myAlert.error('创建单词失败：未登录');
            } else {
                myAlert.error('创建单词失败：网络错误');
            }
        }
    });
};

useTitle('创建单词 | 哈希语词典');
</script>

<style lang="scss" scoped>
.outer-frame {
    width: min(calc(100vw - 8px - 2em), calc(800px - 2em));
    margin: 2em auto;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    padding: 1em;
}

.format-selection {
    padding: 0.25em;
    max-width: 200px;
}

.hash-button-container {
    display: flex;
    > *:not(:last-child) {
        margin-right: 1em;
    }
}
</style>
