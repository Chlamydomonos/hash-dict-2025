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
    Default,
    HasMany,
    NotNull,
    PrimaryKey,
    Unique,
} from '@sequelize/core/decorators-legacy';
import { Category } from './Category';

export class Type extends Model<InferAttributes<Type>, InferCreationAttributes<Type>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare description: string;

    @Attribute(DataTypes.STRING(1))
    @NotNull
    @Unique
    declare end: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Default('ba')
    declare lastReserved: CreationOptional<string>;

    @HasMany(() => Category, {
        foreignKey: {
            name: 'typeId',
            onDelete: 'CASCADE',
        },
        sourceKey: 'id',
        inverse: {
            as: 'type',
        },
    })
    declare categories: NonAttribute<Category[]>;
}
