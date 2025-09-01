import { sql, Transaction } from '@sequelize/core';
import { Category } from '../db/models/Category';

export class CategoryNonExistError extends Error {
    constructor() {
        super('Category not exists');
    }
}

export const chain = async (
    categoryId: number,
    transaction?: Transaction,
): Promise<{ type: { id: number; end: string }; data: { id: number; value: string }[] }> => {
    const category = await Category.findByPk(categoryId, {
        transaction,
        include: {
            association: 'type',
            attributes: ['id', 'end'],
        },
    });
    if (!category) {
        throw new CategoryNonExistError();
    }

    const type = category.type;

    // 递归查询category的所有父类别，包括id和value属性
    const queryResult = await db.query(
        sql`
            with recursive category_chain as (
                -- 基础查询：选择当前分类
                select ${sql.attribute('id')}, ${sql.attribute('value')}, ${sql.attribute('parentId')}
                from ${sql.identifier(Category)}
                where ${sql.attribute('id')} = ${categoryId}

                union all

                -- 递归查询：查找父分类
                select c.${sql.attribute('id')}, c.${sql.attribute('value')}, c.${sql.attribute('parentId')}
                from ${sql.identifier(Category)} c
                inner join category_chain cc on c.${sql.attribute('id')} = cc.${sql.attribute('parentId')}
            )
            select ${sql.attribute('id')}, ${sql.attribute('value')}
            from category_chain
            order by ${sql.attribute('id')}
        `,
        {
            transaction,
            type: 'SELECT',
        },
    );

    const data = queryResult[0] as { id: number; value: string }[];

    return { type, data };
};
