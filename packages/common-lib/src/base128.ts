/**
 * 128进制正整数
 */
export type Base128 = number[];

export class ToBase128Error extends Error {
    constructor() {
        super('Illegal word');
    }
}

const consonantTable = 'bpmfdtnlzcsgkhjr';
const vowelTable = 'aeqiwouy';
const consonantMap: Record<string, number> = {
    b: 0x0,
    p: 0x1,
    m: 0x2,
    f: 0x3,
    d: 0x4,
    t: 0x5,
    n: 0x6,
    l: 0x7,
    z: 0x8,
    c: 0x9,
    s: 0xa,
    g: 0xb,
    k: 0xc,
    h: 0xd,
    j: 0xe,
    r: 0xf,
};

const vowelMap: Record<string, number> = { a: 0, e: 1, q: 2, i: 3, w: 4, o: 5, u: 6, y: 7 };

/**
 * 把单词（DB格式）转化为128进制整数，会检查单词是否合法，但不会进一步检查是否含有保留字
 */
export const toBase128 = (word: string) => {
    if (/^[aeqiwouy]/.test(word)) {
        word = `b${word}`;
    }

    if (word.length % 2 != 0) {
        throw new ToBase128Error();
    }

    const result: Base128 = [];
    for (let i = 0; i < word.length - 1; i += 2) {
        const consonant = word[i];
        const vowel = word[i + 1];
        if (!/^[bpmfdtnlzcsgkhjr]$/.test(consonant) || !/^[aeqiwouy]$/.test(vowel)) {
            throw new ToBase128Error();
        }
        result.push(consonantMap[consonant] * 8 + vowelMap[vowel]);
    }

    return result;
};

/**
 * 把128进制整数转化为单词（DB格式）
 */
export const parseBase128 = (base128: Base128) => {
    let result = '';
    for (const digit of base128) {
        result += consonantTable[digit >> 3];
        result += vowelTable[digit & 7];
    }
    return result;
};

/**
 * 128进制整数加法
 */
export const add128 = (a: Base128, b: Base128): Base128 => {
    const maxLength = Math.max(a.length, b.length);
    const result: Base128 = [];
    let carry = 0;
    for (let i = 0; i < maxLength; i++) {
        const ai = a[a.length - 1 - i] ?? 0;
        const bi = b[b.length - 1 - i] ?? 0;
        let sum = ai + bi + carry;
        carry = Math.floor(sum / 128);
        sum = sum % 128;
        result.unshift(sum);
    }
    if (carry > 0) {
        result.unshift(carry);
    }
    return result;
};

/**
 * 128进制数转换为整数
 */
export const base128ToNum = (base128: Base128): number => {
    let result = 0;
    for (let i = 0; i < base128.length; i++) {
        result = result * 128 + base128[i];
        if (result > Number.MAX_SAFE_INTEGER) {
            result = result % Number.MAX_SAFE_INTEGER;
        }
    }
    return result;
};
