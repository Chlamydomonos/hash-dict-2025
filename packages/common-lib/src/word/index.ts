import { parseAscii, toAscii } from './ascii';
import { parseAsciiNum, toAsciiNum } from './ascii-num';
import { parseChinese, toChinese } from './chinese';
import { parseLatin, toLatin } from './latin';
import { parseNum, toNum } from './num';

export enum WordFormat {
    DB = 'db',
    ASCII = 'ascii',
    LATIN = 'latin',
    NUM = 'num',
    ASCII_NUM = 'asciiNum',
    CHINESE = 'chinese',
}

export const formats = [WordFormat.ASCII, WordFormat.LATIN, WordFormat.NUM, WordFormat.ASCII_NUM, WordFormat.CHINESE];

/**
 * 检查一个单词的格式。该函数只会返回单词可能的格式，不会检查单词是否合法。
 */
export const checkFormat = (word: string) => {
    if (/[0-7]\u0305/.test(word)) {
        return WordFormat.NUM;
    }
    if (/_[0-7]/.test(word)) {
        return WordFormat.ASCII_NUM;
    }
    if (
        /[啊诶额一奥哦无与吧白博比包波不壁怕拍破皮泡剖普披吗没墨米猫某母密发费佛飞否缶父飞大代德地到斗度敌它太特提陶头土体那乃讷尼脑诺努女拉来乐里洛咯路吕咋在则即早走足句擦才册其错草粗去洒赛色习所搜宿序尬改个级高勾古举卡开克七考口库区哈海和吸好后互续杀筛舌析少手书希蜡赖热瑞饶肉入雨伯坡末扶的忒呢了自次丝各可何是日]/.test(
            word,
        )
    ) {
        return WordFormat.CHINESE;
    }
    if (/[əɪɔøʃ]/.test(word)) {
        return WordFormat.LATIN;
    }

    return WordFormat.ASCII;
};

/**
 * 解析一个格式未知的单词为数据库格式。
 */
export const toDB = (word: string) => {
    const format = checkFormat(word);
    let result: string;
    switch (format) {
        case WordFormat.LATIN:
            result = parseLatin(word);
            break;
        case WordFormat.CHINESE:
            result = parseChinese(word);
            break;
        case WordFormat.NUM:
            result = parseNum(word);
            break;
        case WordFormat.ASCII_NUM:
            result = parseAsciiNum(word);
            break;
        default:
            result = parseAscii(word);
    }
    if (/^[aeqiwouy]/.test(result)) {
        result = `b${result}`;
    }
    return result;
};

/**
 * 把一个单词转换为指定的格式
 */
export const toFormat = (word: string, format: Exclude<WordFormat, WordFormat.DB>) => {
    switch (format) {
        case WordFormat.ASCII_NUM:
            return toAsciiNum(word);
        case WordFormat.CHINESE:
            return toChinese(word);
        case WordFormat.LATIN:
            return toLatin(word);
        case WordFormat.NUM:
            return toNum(word);
        default:
            return toAscii(word);
    }
};
