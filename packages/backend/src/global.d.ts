declare var app: import('express').Express;
declare var db:
    | import('@sequelize/core').Sequelize<import('@sequelize/sqlite3').SqliteDialect>
    | import('@sequelize/core').Sequelize<import('@sequelize/postgres').PostgresDialect>;
declare var socketIO: import('socket.io').Server<ServerListenEventMap, ServerEmitEventMap>;
declare var embeddingClientManager: import('./embedding/client-manager').EmbeddingClientManager;
declare var chroma: import('chromadb').Collection | undefined;
declare var embeddingManager: import('./embedding/embedding-manager').EmbeddingManager;
