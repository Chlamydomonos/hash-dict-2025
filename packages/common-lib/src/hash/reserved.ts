import { Base128 } from '../base128';

export const reservedHashList = [71, 79, 87, 95, 103, 111, 119, 127];
export const reservedHashes = new Set(reservedHashList);

/**
 * 找到不小于hash且任意一位都不包含`reservedHashes`中元素的最小128进制数
 */
export const nextHash = (hash: Base128): Base128 => {
    // 复制输入，避免修改原始 hash
    let result = [...hash];
    const n = result.length;
    let changed = false;

    // 从高位到低位，找到第一个需要进位的位置
    for (let i = 0; i < n; i++) {
        if (reservedHashes.has(result[i])) {
            // 当前位是保留位，需进位
            changed = true;
            // 进位
            for (let j = i; j >= 0; j--) {
                let next = result[j] + 1;
                while (reservedHashes.has(next) && next < 128) next++;
                if (next < 128) {
                    result[j] = next;
                    // 低位全部置0
                    for (let k = j + 1; k < n; k++) {
                        let v = 0;
                        while (reservedHashes.has(v) && v < 128) v++;
                        result[k] = v;
                    }
                    break;
                } else {
                    // 需要继续向高位进位
                    result[j] = 0;
                }
                if (j === 0) {
                    // 最高位也溢出，扩展一位
                    let v = 0;
                    while (reservedHashes.has(v) && v < 128) v++;
                    result = [v, ...result];
                }
            }
            break;
        }
    }
    if (!changed) {
        // 检查是否有低位是保留位
        for (let i = n - 1; i >= 0; i--) {
            if (reservedHashes.has(result[i])) {
                // 递归调用，处理进位
                return nextHash(result);
            }
        }
    }
    // 检查是否有任何一位是保留位，若有则递归处理
    for (let i = 0; i < result.length; i++) {
        if (reservedHashes.has(result[i])) {
            return nextHash(result);
        }
    }
    return result;
};

export class HashFullError extends Error {
    constructor() {
        super('Hash full');
    }
}

/**
 * 找到不小于hash的保留哈希值
 */
export const nextReserved = (hash: Base128): Base128 => {
    // 保留数的长度与 reservedHashList 的索引相关
    for (let idx = 0; idx < reservedHashList.length; idx++) {
        const first = reservedHashList[idx];
        const len = idx + 2;
        // 构造最小的保留数
        let candidate = new Array(len).fill(0) as Base128;
        candidate[0] = first;
        // 如果 candidate < hash，则需要递增
        let needInc = false;
        if (candidate.length < hash.length) {
            needInc = true;
        } else if (candidate.length === hash.length) {
            for (let i = 0; i < len; i++) {
                if (candidate[i] < hash[i]) {
                    needInc = true;
                    break;
                } else if (candidate[i] > hash[i]) {
                    break;
                }
            }
        }
        if (needInc) {
            // 需要递增到不小于 hash
            if (candidate.length < hash.length) continue;
            if (candidate.length === hash.length && first <= hash[0]) {
                // 只递增低位
                let found = false;
                let arr = candidate.slice();
                for (let i = 1; i < len; i++) arr[i] = hash[i];
                // 检查 arr 是否 < hash
                let less = false;
                for (let i = 0; i < len; i++) {
                    if (arr[i] < hash[i]) {
                        less = true;
                        break;
                    }
                    if (arr[i] > hash[i]) {
                        break;
                    }
                }
                if (less) {
                    // 低位进位
                    for (let i = len - 1; i >= 1; i--) {
                        if (arr[i] < 127) {
                            arr[i]++;
                            for (let j = i + 1; j < len; j++) arr[j] = 0;
                            found = true;
                            break;
                        }
                    }
                } else {
                    found = true;
                }
                if (found) {
                    return arr as Base128;
                }
                continue;
            }
            continue;
        } else {
            // candidate >= hash
            return candidate as Base128;
        }
    }
    throw new HashFullError();
};
