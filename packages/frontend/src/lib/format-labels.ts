import { WordFormat } from 'common-lib/word/index';

export const formatLabels = {
    [WordFormat.ASCII]: 'ASCII',
    [WordFormat.ASCII_NUM]: 'ASCII数字',
    [WordFormat.CHINESE]: '汉字',
    [WordFormat.LATIN]: '拉丁',
    [WordFormat.NUM]: '数字',
} as Record<WordFormat, string>;
