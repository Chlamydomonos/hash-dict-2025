import {
    CreationOptional,
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    NonAttribute,
} from '@sequelize/core';
import {
    Attribute,
    AutoIncrement,
    BelongsTo,
    Default,
    HasMany,
    NotNull,
    PrimaryKey,
} from '@sequelize/core/decorators-legacy';
import { Type } from './Type';

export class Category extends Model<InferAttributes<Category>, InferCreationAttributes<Category>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare description: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare value: string;

    @Attribute(process.env.POSTGRES_HOST ? DataTypes.BIGINT : DataTypes.INTEGER)
    @NotNull
    declare compareValue: number;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Default('ba')
    declare lastReserved: CreationOptional<string>;

    @Attribute(DataTypes.INTEGER)
    declare vectorId: number | null;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare typeId: number;

    @Attribute(DataTypes.INTEGER)
    declare parentId: number | null;

    @BelongsTo(() => Type, {
        foreignKey: {
            name: 'typeId',
            onDelete: 'CASCADE',
        },
        targetKey: 'id',
        inverse: {
            as: 'categories',
            type: 'hasMany',
        },
    })
    declare type: NonAttribute<Type>;

    @HasMany(() => Category, {
        foreignKey: {
            name: 'parentId',
            onDelete: 'CASCADE',
        },
        sourceKey: 'id',
        inverse: {
            as: 'parent',
        },
    })
    declare children: NonAttribute<Category[]>;

    @BelongsTo(() => Category, {
        foreignKey: {
            name: 'parentId',
            onDelete: 'CASCADE',
        },
        targetKey: 'id',
        inverse: {
            as: 'children',
            type: 'hasMany',
        },
    })
    declare parent: NonAttribute<Category>;
}
