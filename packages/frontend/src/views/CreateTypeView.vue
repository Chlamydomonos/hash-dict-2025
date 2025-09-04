<template>
    <div class="outer-frame">
        <ElFormItem label="格式:" class="format-selection">
            <ElSelect size="small" v-model="selectedFormat" @change="routeFormat">
                <ElOption v-for="format in formats" v-bind:key="format" :value="format" :label="formatLabels[format]" />
            </ElSelect>
        </ElFormItem>
        <ElForm :model="form" :rules ref="formRef">
            <h1>创建类别</h1>
            <ElFormItem prop="creatingEnd" label="后缀：">
                <ElSelect v-model="form.creatingEnd">
                    <ElOption
                        v-for="(end, id) in ends"
                        v-bind:key="id"
                        :value="end"
                        :label="toFormat(end, selectedFormat)"
                    />
                </ElSelect>
            </ElFormItem>
            <h3>输入描述：</h3>
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
import { formatLabels } from '@/lib/format-labels';
import { myAlert } from '@/lib/my-alert';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useTitle } from '@/lib/use-title';
import router from '@/router';
import { formats, toFormat, type WordFormat } from 'common-lib/word/index';
import {
    ElForm,
    ElFormItem,
    ElInput,
    ElOption,
    ElSelect,
    ElButton,
    type FormInstance,
    type FormRules,
} from 'element-plus';
import { reactive, ref } from 'vue';

const props = defineProps({
    format: {
        type: String as () => Exclude<WordFormat, WordFormat.DB>,
        required: true,
    },
});

const selectedFormat = ref(props.format);

const routeFormat = async () => {
    await router.replace({
        name: 'create-type',
        params: {
            format: selectedFormat.value,
        },
    });
};

const ends = ['_', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'z', 'c', 's', 'j', 'r'];

interface FormData {
    creatingEnd: string;
    description: string;
}

const form = reactive<FormData>({
    creatingEnd: '_',
    description: '',
});

const rules = reactive<FormRules<FormData>>({
    description: [{ required: true, message: '请输入描述', trigger: 'blur' }],
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
            const response = (
                await loginRequest('/word/create-type', {
                    end: form.creatingEnd,
                    description: form.description,
                })
            ).data;

            if (response.success) {
                myAlert.success.next('创建成功');
                await router.replace({
                    name: 'type',
                    params: {
                        format: selectedFormat.value,
                        typeId: response.id,
                        type: form.creatingEnd === '' ? '0' : form.creatingEnd,
                    },
                });
                return;
            }

            switch (response.reason) {
                case 'exists':
                    myAlert.error('创建类别失败：后缀已存在');
                    return;
                case 'illegal':
                    myAlert.error('创建类别失败：非法后缀');
                    return;
                default:
                    myAlert.error('创建类别失败：未知错误');
            }
        } catch (e) {
            if (e instanceof NotLoggedInError) {
                myAlert.error('创建类别失败：未登录');
            } else {
                myAlert.error('创建类别失败：网络错误');
            }
        }
    });
};

useTitle('创建类别 | 哈希语词典');
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
</style>
