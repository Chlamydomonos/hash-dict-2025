import { ChromaClient } from 'chromadb';
import { log } from '../log';

export const createChroma = async () => {
    const chroma = new ChromaClient({
        host: process.env.CHROMA_HOST ?? 'localhost',
        port: parseInt(process.env.CHROMA_PORT ?? '3022'),
    });

    const collection = await chroma.getOrCreateCollection({
        name: 'hash-dict',
        embeddingFunction: {
            async generate(texts) {
                return await embeddingClientManager.sendEmbeddingTask(texts);
            },
        },
    });

    log('已成功连接到ChromaDB');

    return collection;
};
