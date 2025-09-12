import moment from 'moment-timezone';

const getDate = () => {
    return moment().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
};

export const log = (...items: any[]) => {
    console.log(`[${getDate()}]`, ...items);
};

export const logError = (...items: any[]) => {
    console.error(`[ERROR: ${getDate()}]`, ...items);
};
