import { sql } from '@sequelize/core';
import { Category } from '../db/models/Category';
import { chain } from './chain';
import { log, logError } from '../log';
import moment from 'moment-timezone';

const getRandomWords = async () => {
    return await db.transaction(async (transaction) => {
        const randomCategories = await (async (): Promise<{ id: number; value: string }[]> => {
            if (process.env.POSTGRES_HOST) {
                const count = await Category.count({ transaction });
                const data = (await db.query(
                    sql`
                        select ${sql.attribute('id')}, ${sql.attribute('value')}
                        from ${sql.identifier(Category)}
                        tablesample system (${Math.min(Math.ceil((40 / count) * 100), 60)})
                        order by random()
                        limit 20
                    `,
                    { transaction, type: 'SELECT' },
                )) as { id: number; value: string }[];
                log('获取Postgres数据:', data);
                return data;
            } else {
                return await Category.findAll({
                    attributes: ['id', 'value'],
                    order: sql`random()`,
                    limit: 20,
                    transaction,
                });
            }
        })();
        return await Promise.all(randomCategories.map((c) => chain(c.id, transaction)));
    });
};

// 缓存每日单词的变量
let dailyWordsCache: Awaited<ReturnType<typeof getRandomWords>> | null = null;
let lastUpdateDate: string | null = null;

// 获取今天的日期字符串 (YYYY-MM-DD)
const getTodayDateString = (): string => {
    return moment().tz('Asia/Shanghai').format('YYYY-MM-DD');
};

// 检查是否需要更新每日单词
const shouldUpdateDailyWords = (): boolean => {
    const today = getTodayDateString();
    return lastUpdateDate !== today || dailyWordsCache === null;
};

// 检查是否在12:00之后（用于判断是否应该更新当天的单词）
const isAfterNoon = (): boolean => {
    const now = moment().tz('Asia/Shanghai');
    return now.hours() >= 12;
};

// 更新每日单词缓存
const updateDailyWords = async (): Promise<void> => {
    try {
        dailyWordsCache = await getRandomWords();
        lastUpdateDate = getTodayDateString();
        log(`每日单词已更新 - ${lastUpdateDate} ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        logError('更新每日单词失败:', error);
        throw error;
    }
};

// 定时检查任务 - 每小时检查一次是否需要更新
export const scheduleHourlyCheck = (): void => {
    const checkAndUpdate = async () => {
        const today = getTodayDateString();

        // 如果缓存为空，直接更新
        if (dailyWordsCache === null) {
            log('缓存为空，立即更新每日单词...');
            await updateDailyWords();
            return;
        }

        // 如果是新的一天且已经过了12:00，则更新
        if (lastUpdateDate !== today && isAfterNoon()) {
            log('检测到新的一天且已过12:00，更新每日单词...');
            await updateDailyWords();
        }
    };

    // 立即执行一次检查
    checkAndUpdate();

    // 每小时执行一次检查
    setInterval(checkAndUpdate, 60 * 60 * 1000); // 1小时 = 60分钟 * 60秒 * 1000毫秒

    log('定时检查任务已启动，每小时检查一次是否需要更新每日单词');
};

export const getDailyWords = async () => {
    // 如果需要更新或者缓存为空，则更新缓存
    if (shouldUpdateDailyWords()) {
        await updateDailyWords();
    }

    // 返回缓存的每日单词
    return dailyWordsCache!;
};
