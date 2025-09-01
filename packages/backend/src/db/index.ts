import Sequelize from '@sequelize/core';
import { PostgresDialect } from '@sequelize/postgres';
import { SqliteDialect } from '@sequelize/sqlite3';
import { User } from './models/User';
import { Type } from './models/Type';
import { Category } from './models/Category';

const models = [User, Type, Category];

export const db = process.env.POSTGRES_HOST
    ? new Sequelize({
          dialect: PostgresDialect,
          database: process.env.POSTGRES_DATABASE,
          user: process.env.POSTGRES_USER,
          password: process.env.POSTGRES_PASSWORD,
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT!),
          models,
      })
    : new Sequelize({
          dialect: SqliteDialect,
          storage: process.env.SQLITE_DB_FILE ?? ':memory:',
          models,
      });
