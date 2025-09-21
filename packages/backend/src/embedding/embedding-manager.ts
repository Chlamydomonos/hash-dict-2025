import { Op, type Transaction } from '@sequelize/core';
import { Category } from '../db/models/Category';

export class EmbeddingNotEnabledError extends Error {
    constructor() {
        super('Embedding not enabled');
    }
}

export class NoClientError extends Error {
    constructor() {
        super('No embedding client available');
    }
}

const embedWords = async (words: Category[], transaction?: Transaction) => {
    if (!chroma) {
        throw new EmbeddingNotEnabledError();
    }

    if (embeddingClientManager.getLoggedInClientCount() == 0) {
        throw new NoClientError();
    }

    for (const word of words) {
        if (word.vectorId) {
            throw new Error('Already embedded');
        }
    }

    await chroma.add({
        ids: words.map((w) => w.id.toString()),
        documents: words.map((w) => w.description),
    });

    for (const word of words) {
        word.vectorId = word.id;
    }

    await Promise.all(words.map((w) => w.save({ transaction })));
};

const embedWordsById = async (ids: number[]) => {
    await db.transaction(async (transaction) => {
        await embedWords(await Category.findAll({ where: { id: { [Op.in]: ids } }, transaction }), transaction);
    });
};

export class InProgressError extends Error {
    constructor() {
        super('Embed all task in progress');
    }
}

export class EmbeddingManager {
    private embedAll: NodeJS.Timeout | undefined;
    private inTask = false;
    private failReason = '';

    async embedWord(id: number) {
        if (this.embedAll || this.inTask) {
            throw new InProgressError();
        }

        this.inTask = true;
        try {
            await embedWordsById([id]);
            this.inTask = false;
        } catch (e) {
            this.inTask = false;
            throw e;
        }
    }

    private async emitEmbedAllTask(transaction: Transaction) {
        this.inTask = true;
        const words = await Category.findAll({
            where: { vectorId: null },
            order: ['id'],
            limit: 5,
            transaction,
        });

        try {
            await embedWords(words, transaction);
            this.inTask = false;
        } catch (e) {
            this.inTask = false;
            throw e;
        }
    }

    private endEmbedAllTask(reason: string) {
        clearInterval(this.embedAll);
        this.embedAll = undefined;
        this.failReason = reason;
        return;
    }

    startEmbedAllTask() {
        if (this.embedAll) {
            return;
        }

        this.embedAll = setInterval(async () => {
            if (this.inTask) {
                return;
            }

            if (!chroma) {
                return this.endEmbedAllTask('Embedding not enabled');
            }

            if (embeddingClientManager.getLoggedInClientCount() == 0) {
                return this.endEmbedAllTask('No available embedding client');
            }

            try {
                await db.transaction(async (transaction) => {
                    const count = await Category.count({ where: { vectorId: null }, transaction });
                    if (count == 0) {
                        return this.endEmbedAllTask('All words embedded');
                    }

                    await this.emitEmbedAllTask(transaction);
                });
            } catch (e) {
                this.endEmbedAllTask(e instanceof Error ? e.message : 'Unknown error');
            }
        }, 1000);
    }

    embedding() {
        return !!this.embedAll || this.inTask;
    }

    async getProgress() {
        return await db.transaction(async (transaction) => ({
            inProgress: !!this.embedAll,
            embedded: await Category.count({ where: { vectorId: { [Op.not]: null } }, transaction }),
            total: await Category.count({ transaction }),
            error: this.failReason,
        }));
    }
}
