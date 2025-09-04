<template>
    <div>
        <slot :page="currentPage"></slot>
        <div class="buttons-container" v-if="pageCount > 1">
            <ElLink :icon="DArrowLeft" :disabled="currentPage <= 1" @click="goToFirstPage" />
            <ElLink :icon="ArrowLeft" :disabled="currentPage <= 1" @click="goToPreviousPage" />
            <div class="middle-component">
                <ElInput size="small" v-model="inputPageNumber" @keyup.enter="goToPage" />
                / {{ pageCount }}
                <ElLink @click="goToPage">跳转</ElLink>
            </div>
            <ElLink :icon="ArrowRight" :disabled="currentPage >= pageCount" @click="goToNextPage" />
            <ElLink :icon="DArrowRight" :disabled="currentPage >= pageCount" @click="goToLastPage" />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ArrowLeft, ArrowRight, DArrowLeft, DArrowRight } from '@element-plus/icons-vue';
import { ElInput, ElLink } from 'element-plus';
import { ref, watch } from 'vue';

const props = defineProps({
    pageCount: {
        type: Number,
        required: true,
    },
    initialPage: {
        type: Number,
        default: 1,
    },
});

const emit = defineEmits<{
    pageChange: [page: number];
}>();

const currentPage = ref(props.initialPage);
const inputPageNumber = ref(props.initialPage.toString());

// 监听currentPage变化，同步更新inputPageNumber
watch(currentPage, (newPage) => {
    inputPageNumber.value = newPage.toString();
    emit('pageChange', newPage);
});

// 监听initialPage变化，同步更新currentPage
watch(
    () => props.initialPage,
    (newInitialPage) => {
        currentPage.value = newInitialPage;
    },
);

// 跳转到首页
const goToFirstPage = () => {
    if (currentPage.value > 1) {
        currentPage.value = 1;
    }
};

// 跳转到上一页
const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
};

// 跳转到下一页
const goToNextPage = () => {
    if (currentPage.value < props.pageCount) {
        currentPage.value++;
    }
};

// 跳转到末页
const goToLastPage = () => {
    if (currentPage.value < props.pageCount) {
        currentPage.value = props.pageCount;
    }
};

// 跳转到指定页
const goToPage = () => {
    const targetPage = parseInt(inputPageNumber.value);

    // 验证输入是否有效
    if (isNaN(targetPage)) {
        // 如果输入无效，重置为当前页
        inputPageNumber.value = currentPage.value.toString();
        return;
    }

    // 确保页码在有效范围内
    const validPage = Math.max(1, Math.min(targetPage, props.pageCount));

    if (validPage !== currentPage.value) {
        currentPage.value = validPage;
    }

    // 更新输入框显示
    inputPageNumber.value = validPage.toString();
};
</script>

<style lang="scss" scoped>
.buttons-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 0;
    margin-top: 8px;
    border-top: 1px solid var(--el-border-color-light);
}

.middle-component {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 16px;
    white-space: nowrap;

    .el-input {
        width: 60px;
        flex-shrink: 0;
    }
}
</style>
