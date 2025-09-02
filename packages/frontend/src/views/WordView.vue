<template>word: {{ fullWord }}</template>

<script lang="ts" setup>
import { toFormat, type WordFormat } from 'common-lib/word/index';
import { computed } from 'vue';

const props = defineProps({
    format: {
        type: {} as () => Exclude<WordFormat, WordFormat.DB>,
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

const fullWord = computed(() => {
    let word = '';
    for (const category of props.categories) {
        word += category.value;
    }
    word += props.type.end;
    return toFormat(word, props.format);
});
</script>

<style lang="scss" scoped></style>
