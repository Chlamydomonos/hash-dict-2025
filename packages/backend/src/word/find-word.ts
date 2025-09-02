import { sql } from '@sequelize/core';
import { Category } from '../db/models/Category';
import { Type } from '../db/models/Type';

export class FindWordError extends Error {
    constructor() {
        super('Word does not exist');
    }
}

export const findWord = async (word: string) => {
    if (!/^[a-z]+$/.test(word)) {
        throw new FindWordError();
    }

    let wordType = '';
    if (/[bpmfdtnlzcsgkhjr]$/.test(word)) {
        wordType = word[word.length - 1];
        word = word.slice(0, -1);
    }

    return await db.transaction(async (transaction) => {
        const type = await Type.findOne({
            where: { end: wordType },
            attributes: ['id', 'end'],
            transaction,
        });

        if (!type) {
            throw new FindWordError();
        }

        if (/^[aeqiwouy]/.test(word)) {
            word = `b${word}`;
        }

        const categories: { id: number; value: string }[] = [];
        let parentId: number | null = null;
        while (word.length > 0) {
            const category = await Category.findOne({
                where: [
                    {
                        typeId: type.id,
                        parentId,
                    },
                    sql`${word} like concat(${sql.attribute('value')}, '%')`,
                ],
                attributes: ['id', 'value'],
                transaction,
            });

            if (!category) {
                throw new FindWordError();
            }

            word = word.slice(category.value.length);
            categories.push(category);
            parentId = category.id as number;
        }

        return { type, categories };
    });
};
