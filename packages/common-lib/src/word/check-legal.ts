import { toBase128 } from '../base128';
import { reservedHashes, reservedHashList } from '../hash/reserved';

/**
 * 检查单词（DB格式）（准确来说是Category而非单词）是否合法。
 *
 * 如果合法，返回true
 *
 * 如果含有非法字符，抛出ToBase128Error
 *
 * 如果含有保留字符且不符合保留字规则，返回false
 */
export const checkLegal = (word: string) => {
    if (word == 'hajy') {
        return true;
    }

    const base128 = toBase128(word);
    if (reservedHashes.has(base128[0])) {
        const length = reservedHashList.indexOf(base128[0]) + 2;
        return length == word.length;
    }

    for (let digit of base128) {
        if (reservedHashes.has(digit)) {
            return false;
        }
    }
};
