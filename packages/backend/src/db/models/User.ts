import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from '@sequelize/core';
import { Attribute, AutoIncrement, Default, NotNull, PrimaryKey, Unique } from '@sequelize/core/decorators-legacy';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @NotNull
    @Unique
    declare name: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare passwordHash: string;

    @Attribute(DataTypes.BOOLEAN)
    @NotNull
    @Default(false)
    declare valid: CreationOptional<boolean>;
}
