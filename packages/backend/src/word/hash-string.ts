import { add128, Base128, parseBase128, toBase128 } from 'common-lib/base128';
import { Category } from '../db/models/Category';
import { Op, sql, Transaction } from '@sequelize/core';
import { Type } from '../db/models/Type';
import { nextHash, nextReserved } from 'common-lib/hash/reserved';

const getInitialHash = (str: string): Base128 => {
    // 实现一个简单的哈希算法
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }

    if (hash < 0) {
        hash = -hash;
    }

    const lastBits = hash & 0x4;

    if (lastBits < 3) {
        // 3/8 概率，生成3位128进制数 (128² 到 128³-1)
        const range = 128 * 128 * 128 - 128 * 128; // 128³ - 128²
        const value = (hash % range) + 128 * 128; // 确保在3位数范围内

        // 转换为128进制数组
        const result: Base128 = [];
        let temp = value;
        for (let i = 0; i < 3; i++) {
            result.unshift(temp % 128);
            temp = Math.floor(temp / 128);
        }
        return result;
    } else {
        // 5/8 概率，生成2位128进制数 (0 到 128²-1)
        const range = 128 * 128;
        const value = hash % range;

        // 转换为128进制数组
        const result: Base128 = [];
        let temp = value;
        if (temp === 0) {
            return [0];
        }

        while (temp > 0) {
            result.unshift(temp % 128);
            temp = Math.floor(temp / 128);
        }

        // 确保至少是2位数（除了0）
        if (result.length === 1 && result[0] !== 0) {
            result.unshift(0);
        }

        return result;
    }
};

export class ParentNonExistError extends Error {
    constructor() {
        super('parent not exist');
    }
}

export class TypeNonExistError extends Error {
    constructor() {
        super('type not exist');
    }
}

export const hashString = async (
    original: string,
    parentId: number | null,
    typeId: number,
    transaction?: Transaction,
) => {
    const parent = parentId ? await Category.findByPk(parentId, { transaction }) : undefined;
    if (parentId !== null && !parent) {
        throw new ParentNonExistError();
    }
    const type = await Type.findByPk(typeId, { transaction });
    if (!type) {
        throw new TypeNonExistError();
    }

    let hash = nextHash(getInitialHash(original));
    for (let i = 0; i < 20; i++) {
        const word = parseBase128(hash);
        const prefixedWords = await Category.findAll({
            where: {
                typeId,
                parentId,
                [Op.or]: [
                    { value: { [Op.like]: `'${word}%'` } },
                    sql`${word} like concat(${sql.attribute('value')}, '%')`,
                ],
            },
            transaction,
        });

        if (prefixedWords.length == 0) {
            return word;
        }

        let addedOne = false;

        for (const prefix of prefixedWords) {
            if (prefix.value.length >= word.length) {
                if (!addedOne) {
                    hash = add128(hash, [1]);
                    addedOne = true;
                }
            } else {
                const offset: Base128 = new Array(word.length - prefix.value.length).fill(0);
                offset.unshift(1);
                hash = add128(hash, offset);
            }
        }
        hash = nextHash(hash);
    }

    const lastReserved = toBase128(parent?.lastReserved ?? type.lastReserved);
    return parseBase128(nextReserved(add128(lastReserved, [1])));
};
