<template>search: {{ word }}</template>

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
            router.replace({
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
                    myAlert.warning('查找失败：非法单词');
                    router.back();
                    return;
                case 'not_exists':
                    myAlert.warning('查找失败：单词不存在');
                    router.back();
                    return;
                default:
                    myAlert.error('查找失败：未知错误');
                    router.back();
            }
        }
    } catch (e) {
        myAlert.error('查找失败：网络错误');
        router.back();
    }
});
</script>

<style lang="scss" scoped></style>
