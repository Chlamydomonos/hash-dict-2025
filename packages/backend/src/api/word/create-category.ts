import { fail, needLogin, succeed, tryResponse } from '../../api-helper';
import { createApi } from '../../create-api';
import type { WordCreateCategoryReq, WordCreateCategoryRes } from 'common-lib/api/word/create-category';
import { Type } from '../../db/models/Type';
import { Category } from '../../db/models/Category';
import { checkLegal } from 'common-lib/word/check-legal';
import { add128, base128ToNum, parseBase128, toBase128, ToBase128Error } from 'common-lib/base128';
import { Op, sql } from '@sequelize/core';

createApi<WordCreateCategoryReq, WordCreateCategoryRes>('/word/create-category', async (req, res) => {
    await tryResponse(res, async () => {
        const { typeId, parentId, value, description } = req.body;
        await db.transaction(async (transaction) => {
            const user = await needLogin(req, res, { transaction });
            if (!user) {
                return;
            }

            try {
                if (!checkLegal(value)) {
                    return fail(res, 'illegal_reserved');
                }
            } catch (e) {
                if (e instanceof ToBase128Error) {
                    return fail(res, 'illegal');
                } else {
                    throw e;
                }
            }

            const type = await Type.findByPk(typeId, { transaction });
            if (!type) {
                return fail(res, 'type_not_exists');
            }

            const parent = parentId ? await Category.findByPk(parentId, { transaction }) : undefined;
            if (parentId !== null && !parent) {
                return fail(res, 'parent_not_exists');
            }

            let isReserved = false;
            if (/^(zy|cy|sy|gy|ky|hy|jy|ry)/.test(value)) {
                const nextReserved = parseBase128(add128(toBase128(parent?.lastReserved ?? type.lastReserved), [1]));
                if (value != nextReserved) {
                    return fail(res, 'reserved', { nextReserved });
                }
                isReserved = true;
            }

            const prefixes = await Category.findAll({
                where: {
                    typeId,
                    parentId,
                    [Op.or]: [
                        { value: { [Op.like]: `${value}%` } },
                        sql`${value} like concat(${sql.attribute('value')}, '%')`,
                    ],
                },
                attributes: ['value'],
                transaction,
            });
            if (prefixes.length > 0) {
                return fail(res, 'prefix', { prefixes: prefixes.map((p) => p.value) });
            }

            const newCategory = await Category.create(
                {
                    value,
                    compareValue: base128ToNum(toBase128(value)),
                    description,
                    parentId,
                    typeId,
                },
                { transaction },
            );
            if (isReserved) {
                if (parent) {
                    parent.lastReserved = value;
                    await parent.save({ transaction });
                } else {
                    type.lastReserved = value;
                    await type.save({ transaction });
                }
            }
            succeed(res, { id: newCategory.id });
        });
    });
});
