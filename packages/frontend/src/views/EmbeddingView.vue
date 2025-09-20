<template>
    <div class="embedding-view">
        <template v-if="loggedIn">
            <el-card class="control-panel">
                <template #header>
                    <div class="card-header">
                        <span>向量化控制面板</span>
                    </div>
                    <span class="tool-document">
                        向量化客户端:
                        <a href="https://github.com/Chlamydomonos/hash-dict-embedding-tool">
                            https://github.com/Chlamydomonos/hash-dict-embedding-tool
                        </a>
                    </span>
                </template>

                <!-- 客户端信息展示 -->
                <div class="client-section">
                    <div class="section-header">
                        <h3>客户端信息</h3>
                        <el-button size="small" :loading="refreshing" @click="refreshClientData" :icon="Refresh">
                            刷新
                        </el-button>
                    </div>
                    <el-row :gutter="20" class="client-info">
                        <el-col :span="12">
                            <el-statistic title="我的向量化客户端" :value="clientData.count" suffix="个">
                                <template #prefix>
                                    <el-icon><User /></el-icon>
                                </template>
                            </el-statistic>
                        </el-col>
                        <el-col :span="12">
                            <el-statistic title="总向量化客户端" :value="clientData.total" suffix="个">
                                <template #prefix>
                                    <el-icon><Connection /></el-icon>
                                </template>
                            </el-statistic>
                        </el-col>
                    </el-row>
                </div>

                <el-divider />

                <!-- 进度信息展示 -->
                <div class="progress-section">
                    <h3>向量化进度</h3>
                    <div v-if="progressData.total > 0" class="progress-info">
                        <el-progress
                            :percentage="Math.round((progressData.embedded / progressData.total) * 100)"
                            :status="progressData.inProgress ? undefined : 'success'"
                            :stroke-width="20"
                        />
                        <div class="progress-text">
                            <span>已完成: {{ progressData.embedded }} / {{ progressData.total }}</span>
                            <el-tag :type="progressData.inProgress ? 'warning' : 'success'" size="small">
                                {{ progressData.inProgress ? '进行中' : '已完成' }}
                            </el-tag>
                        </div>
                    </div>
                    <div v-else class="no-progress">
                        <el-empty description="暂无向量化任务" />
                    </div>
                </div>

                <el-divider />

                <!-- 控制按钮 -->
                <div class="control-section">
                    <el-button
                        type="primary"
                        size="large"
                        :disabled="clientData.count <= 0 || progressData.inProgress"
                        :loading="progressData.inProgress"
                        @click="startEmbed"
                    >
                        <el-icon><VideoPlay /></el-icon>
                        {{ progressData.inProgress ? '向量化进行中...' : '开始向量化全部单词' }}
                    </el-button>

                    <div class="button-tip">
                        <el-text v-if="clientData.count <= 0" type="warning" size="small">
                            需要至少一个向量化客户端才能开始任务
                        </el-text>
                        <el-text v-else-if="progressData.inProgress" type="info" size="small">
                            向量化任务正在进行中，请等待完成
                        </el-text>
                        <el-text v-else type="success" size="small"> 准备就绪，可以开始向量化任务 </el-text>
                    </div>
                </div>
            </el-card>
        </template>
        <template v-else>
            <el-result icon="warning" title="未登录" sub-title="请登录后使用向量化功能" />
        </template>
    </div>
</template>

<script lang="ts" setup>
import { myAlert } from '@/lib/my-alert';
import { loginRequest, NotLoggedInError } from '@/lib/request-helper';
import { useSessionStore } from '@/stores/session';
import { storeToRefs } from 'pinia';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import {
    ElCard,
    ElRow,
    ElCol,
    ElStatistic,
    ElIcon,
    ElDivider,
    ElProgress,
    ElTag,
    ElEmpty,
    ElButton,
    ElText,
    ElResult,
} from 'element-plus';
import { User, Connection, VideoPlay, Refresh } from '@element-plus/icons-vue';

const { loggedIn } = storeToRefs(useSessionStore());

const clientData = ref({ count: -1, total: -1 });
const refreshing = ref(false);

const progressData = ref<{ inProgress: boolean; embedded: number; total: number; error?: string }>({
    inProgress: false,
    embedded: -1,
    total: -1,
});

const intervalId = ref<number>();

const loadProgress = async () => {
    try {
        const response = (await loginRequest('/embedding/progress', {})).data;
        if (response.success) {
            if (progressData.value.inProgress && !response.inProgress) {
                myAlert(`向量化任务已停止: ${response.error}`);
            }
            progressData.value = response;
        } else {
            myAlert.error('获取向量化进度失败: 未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('获取向量化进度失败: 未登录');
        } else {
            myAlert.error('获取向量化进度失败: 网络错误');
        }
    }
};

onMounted(async () => {
    if (!loggedIn.value) {
        myAlert.warning('未登录，向量化页面将不会展示');
        return;
    }

    try {
        const res = (await loginRequest('/embedding/my-clients', {})).data;
        if (res.success) {
            clientData.value = res;
        } else {
            myAlert.error('获取向量化信息失败: 未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.warning('未登录，向量化页面将不会展示');
            return;
        } else {
            myAlert.error('获取向量化信息失败: 网络错误');
        }
    }

    intervalId.value = setInterval(loadProgress, 1000);
});

onBeforeUnmount(() => {
    clearInterval(intervalId.value);
});

const startEmbed = async () => {
    try {
        const response = (await loginRequest('/embedding/embed-all', {})).data;
        if (!response.success) {
            myAlert.error('开始向量化任务失败: 未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('开始向量化任务失败: 未登录');
        } else {
            myAlert.error('开始向量化任务失败: 网络错误');
        }
    }
};

const refreshClientData = async () => {
    if (!loggedIn.value) {
        myAlert.warning('未登录，无法刷新客户端数据');
        return;
    }

    refreshing.value = true;
    try {
        const res = (await loginRequest('/embedding/my-clients', {})).data;
        if (res.success) {
            clientData.value = res;
            myAlert.success('客户端数据已刷新');
        } else {
            myAlert.error('刷新客户端数据失败: 未知错误');
        }
    } catch (e) {
        if (e instanceof NotLoggedInError) {
            myAlert.error('刷新客户端数据失败: 未登录');
        } else {
            myAlert.error('刷新客户端数据失败: 网络错误');
        }
    } finally {
        refreshing.value = false;
    }
};
</script>

<style lang="scss" scoped>
.embedding-view {
    padding: 20px;
    max-width: 800px;
    margin: 0 auto;
}

.control-panel {
    .card-header {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
    }
}

.client-info {
    margin-bottom: 20px;

    .el-statistic {
        text-align: center;
    }
}

.client-section {
    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: var(--el-text-color-primary);
        }
    }
}

.progress-section {
    h3 {
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
    }

    .progress-info {
        .el-progress {
            margin-bottom: 12px;
        }

        .progress-text {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            font-size: 14px;
            color: var(--el-text-color-regular);
        }

        .error-message {
            margin-top: 12px;
        }
    }

    .no-progress {
        text-align: center;
        padding: 20px 0;
    }
}

.control-section {
    text-align: center;

    .el-button {
        margin-bottom: 12px;
        min-width: 200px;
    }

    .button-tip {
        .el-text {
            display: block;
        }
    }
}

@media (max-width: 768px) {
    .embedding-view {
        padding: 10px;
    }

    .client-info {
        .el-col {
            margin-bottom: 16px;
        }
    }

    .control-section {
        .el-button {
            width: 100%;
            min-width: auto;
        }
    }
}

.tool-document {
    color: var(--el-text-color-regular);
    font-size: small;
}
</style>
