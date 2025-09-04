<template>
    <div v-html="kramed(text)"></div>
</template>

<script lang="ts" setup>
import kramedRaw from 'kramed';

const kramed = kramedRaw as unknown as import('kramed').KramedStatic;

defineProps({
    text: {
        type: String,
        default: '',
    },
});
</script>

<style lang="scss"></style>
