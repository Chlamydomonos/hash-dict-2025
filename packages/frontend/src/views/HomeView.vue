<template>
    <div class="main-title-container">
        <div class="main-title" ref="mainTitle">
            <div class="main-title-text" ref="mainTitleText">
                <RouterLink :to="{ name: 'search', params: { word: 'haʃø' } }">haʃø</RouterLink>
                /
                <RouterLink :to="{ name: 'search', params: { word: 'hashy' } }">hashy</RouterLink>
                /
                <RouterLink :to="{ name: 'search', params: { word: 'D0̅E7̅' } }">D0̅E7̅</RouterLink>
                /
                <RouterLink :to="{ name: 'search', params: { word: 'D_0E_7' } }">D_0E_7</RouterLink>
                /
                <RouterLink :to="{ name: 'search', params: { word: '哈希' } }">哈希</RouterLink>
            </div>
            <div class="title" ref="titleElement">哈希语词典</div>
        </div>
    </div>
    <div class="types-container" v-if="types">
        <ElButton v-for="(type, id) in types" v-bind:key="id" circle size="small" @click="toType(type)">
            {{ toFormat(type.end, formats[formatId]) }}
        </ElButton>
        <ElButton v-if="loggedIn" circle size="small" @click="toCreateType">
            <template #icon><Plus /></template>
        </ElButton>
    </div>
    <div class="words-container" v-if="words">
        <div v-for="(word, id) in words" v-bind:key="id">
            <ElLink class="word-link" underline="always" @click="toWord(word)">{{ fullWord(word) }}</ElLink>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { myAlert } from '@/lib/my-alert';
import { request } from '@/lib/request';
import { useTitle } from '@/lib/use-title';
import router from '@/router';
import { useSessionStore } from '@/stores/session';
import { Plus } from '@element-plus/icons-vue';
import { formats, toFormat } from 'common-lib/word/index';
import { ElButton, ElLink } from 'element-plus';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref } from 'vue';

const mainTitle = ref<HTMLElement>();
const mainTitleText = ref<HTMLElement>();
const titleElement = ref<HTMLElement>();

const adjustFontSize = () => {
    let minFontSize = 1;
    let maxFontSize = window.innerWidth;
    let fontSize = (minFontSize + maxFontSize) / 2;

    mainTitleText.value!.style.fontSize = fontSize + 'px';

    while (maxFontSize - minFontSize > 1) {
        if (mainTitleText.value!.offsetWidth < mainTitle.value!.offsetWidth) {
            minFontSize = fontSize;
        } else {
            maxFontSize = fontSize;
        }

        fontSize = (minFontSize + maxFontSize) / 2;
        mainTitleText.value!.style.fontSize = fontSize + 'px';
    }

    if (mainTitleText.value!.offsetWidth < mainTitle.value!.offsetWidth) {
        mainTitleText.value!.style.fontSize = maxFontSize + 'px';
    } else {
        mainTitleText.value!.style.fontSize = minFontSize + 'px';
    }
};

const adjustTitleFontSize = () => {
    let minFontSize = 1;
    let maxFontSize = 64; // 4rem = 64px (assuming 1rem = 16px)
    let fontSize = (minFontSize + maxFontSize) / 2;
    const maxWidth = window.innerWidth * 0.6; // 60vw

    titleElement.value!.style.fontSize = fontSize + 'px';

    while (maxFontSize - minFontSize > 1) {
        if (titleElement.value!.offsetWidth < maxWidth) {
            minFontSize = fontSize;
        } else {
            maxFontSize = fontSize;
        }

        fontSize = (minFontSize + maxFontSize) / 2;
        titleElement.value!.style.fontSize = fontSize + 'px';
    }

    if (titleElement.value!.offsetWidth < maxWidth) {
        titleElement.value!.style.fontSize = maxFontSize + 'px';
    } else {
        titleElement.value!.style.fontSize = minFontSize + 'px';
    }
};

onMounted(() => {
    adjustFontSize();
    adjustTitleFontSize();
    window.addEventListener('resize', adjustFontSize);
    window.addEventListener('resize', adjustTitleFontSize);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', adjustFontSize);
    window.removeEventListener('resize', adjustTitleFontSize);
});

const types = ref<{ id: number; end: string }[]>();

onMounted(async () => {
    try {
        const res = (await request('/word/list-types', {})).data;
        if (!res.success) {
            myAlert.error('获取类别列表失败：未知错误');
            return;
        }

        types.value = res.data;
    } catch (e) {
        myAlert.error('获取类别列表失败：网络错误');
    }
});

const { loggedIn } = storeToRefs(useSessionStore());

interface Word {
    type: { id: number; end: string };
    data: { id: number; value: string }[];
}

const words = ref<Word[]>();

onMounted(async () => {
    try {
        const res = (await request('/word/daily', {})).data;
        if (!res.success) {
            myAlert.error('获取每日单词失败：未知错误');
            return;
        }

        words.value = res.data;
    } catch (e) {
        myAlert.error('获取每日单词失败：网络错误');
    }
});

const formatId = ref(0);
onMounted(() => {
    setInterval(() => {
        formatId.value = (formatId.value + 1) % formats.length;
    }, 2000);
});

const fullWord = (word: Word) => {
    let target = '';
    for (const category of word.data) {
        target += category.value;
    }
    target += word.type.end;
    if (target.startsWith('b')) {
        target = target.slice(1);
    }
    return toFormat(target, formats[formatId.value]);
};

const toWord = async (word: Word) => {
    await router.push({
        name: 'word',
        params: {
            format: formats[formatId.value],
            typeId: word.type.id,
            type: word.type.end == '' ? '0' : word.type.end,
            categories: word.data.flatMap((c) => [c.id.toString(), c.value]),
        },
    });
};

const toType = async (type: { id: number; end: string }) => {
    await router.push({
        name: 'type',
        params: {
            format: formats[formatId.value],
            typeId: type.id,
            type: type.end == '' ? '0' : type.end,
        },
    });
};

const toCreateType = async () => {
    await router.push({
        name: 'create-type',
        params: { format: formats[formatId.value] },
    });
};

useTitle('哈希语词典');
</script>

<style lang="scss" scoped>
.main-title-container {
    margin: 0 2em;
    margin-bottom: 1rem;
}

.main-title {
    width: 100%;
    margin-top: 1rem;
    text-align: center;
    color: var(--el-color-info);

    a {
        color: var(--el-text-color-regular);
        font-weight: bold;
        text-decoration: none;

        &:hover {
            color: var(--el-text-color-primary);
        }
    }

    .title {
        font-weight: bold;
        width: fit-content;
        margin: 0 auto;
    }
}

.main-title-text {
    width: max-content;
}

.types-container {
    margin: 0 3rem;
    display: flex;
    justify-content: center;
}

.words-container {
    margin: 2rem 3rem;
    display: grid;
    gap: 1rem;

    @media (min-width: 601px) {
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(4, 1fr);
    }

    @media (max-width: 600px) {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: repeat(10, 1fr);
    }

    > div {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem;
        height: 32px;
    }
}

.word-link {
    --el-link-hover-text-color: var(--el-text-color-primary);
}
</style>
