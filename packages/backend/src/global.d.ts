declare var app: import('express').Express;
declare var db:
    | import('@sequelize/core').Sequelize<import('@sequelize/sqlite3').SqliteDialect>
    | import('@sequelize/core').Sequelize<import('@sequelize/postgres').PostgresDialect>;
