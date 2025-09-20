import { User } from '../db/models/User';
import { Socket } from 'socket.io';
import { log, logError } from '../log';

const KEEPALIVE_TIMEOUT = 5 * 60 * 1000; // 5分钟超时

interface EmbeddingClient {
    socket: Socket;
    userId: number;
    username: string;
    lastKeepalive: Date;
    isLoggedIn: boolean;
}

export class EmbeddingClientManager {
    private clients: Map<string, EmbeddingClient> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        this.setupSocketHandlers();
        // 每2分钟检查一次过期的客户端
        this.cleanupInterval = setInterval(
            () => {
                this.cleanupExpiredClients();
            },
            2 * 60 * 1000,
        );
    }

    private setupSocketHandlers(): void {
        socketIO.on('connection', (socket) => {
            log(`新的向量化客户端连接: ${socket.id}`);

            // 添加到未登录客户端列表
            this.clients.set(socket.id, {
                socket,
                userId: 0,
                username: '',
                lastKeepalive: new Date(),
                isLoggedIn: false,
            });

            // 处理登录事件
            socket.on('login', async (userInfo, callback) => {
                await this.handleLogin(socket.id, userInfo, callback);
            });

            // 处理keepalive事件
            socket.on('keepalive', (callback) => {
                this.handleKeepalive(socket.id, callback);
            });

            // 处理断开连接
            socket.on('disconnect', () => {
                log(`向量化客户端断开连接: ${socket.id}`);
                this.clients.delete(socket.id);
            });
        });
    }

    private async handleLogin(
        socketId: string,
        userInfo: { name: string; passwordHash: string },
        callback: (success: boolean, message?: string) => void,
    ): Promise<void> {
        try {
            const client = this.clients.get(socketId);
            if (!client) {
                callback(false, '客户端不存在');
                return;
            }

            // 验证用户信息
            const user = await User.findOne({
                where: {
                    name: userInfo.name,
                },
            });

            if (!user) {
                callback(false, '用户不存在');
                return;
            }

            if (!user.valid) {
                callback(false, '用户账户未启用');
                return;
            }

            if (user.passwordHash !== userInfo.passwordHash) {
                callback(false, '密码错误');
                return;
            }

            // 更新客户端信息
            client.userId = user.id;
            client.username = user.name;
            client.isLoggedIn = true;
            client.lastKeepalive = new Date();

            log(`向量化客户端登录成功: ${user.name} (${socketId})`);
            callback(true, '登录成功');
        } catch (error) {
            logError('向量化客户端登录错误:', error);
            callback(false, '服务器内部错误');
        }
    }

    private handleKeepalive(socketId: string, callback: () => void): void {
        const client = this.clients.get(socketId);
        if (client && client.isLoggedIn) {
            client.lastKeepalive = new Date();
            callback();
        }
    }

    private cleanupExpiredClients(): void {
        const now = new Date();
        for (const [socketId, client] of this.clients.entries()) {
            if (client.isLoggedIn) {
                const timeSinceLastKeepalive = now.getTime() - client.lastKeepalive.getTime();
                if (timeSinceLastKeepalive > KEEPALIVE_TIMEOUT) {
                    log(`向量化客户端超时断开: ${client.username} (${socketId})`);
                    client.socket.disconnect(true);
                    this.clients.delete(socketId);
                }
            }
        }
    }

    /**
     * 向随机的已登录向量化客户端发送任务
     * @param texts 要向量化的文本数组
     * @returns Promise<number[][]> 向量化结果
     */
    public async sendEmbeddingTask(texts: string[]): Promise<number[][]> {
        return new Promise((resolve, reject) => {
            // 获取所有已登录的客户端
            const loggedInClients = Array.from(this.clients.values()).filter((client) => client.isLoggedIn);

            if (loggedInClients.length === 0) {
                reject(new Error('没有可用的向量化客户端'));
                return;
            }

            // 随机选择一个客户端
            const randomIndex = Math.floor(Math.random() * loggedInClients.length);
            const selectedClient = loggedInClients[randomIndex];

            log(`向向量化客户端发送任务: ${selectedClient.username} (${selectedClient.socket.id})`);

            // 发送任务并设置超时
            const timeout = setTimeout(() => {
                reject(new Error('向量化任务超时'));
            }, 120000); // 120秒超时

            selectedClient.socket.emit('task', texts, (embeddings: number[][]) => {
                clearTimeout(timeout);
                resolve(embeddings);
            });
        });
    }

    /**
     * 检查指定用户是否有已登录的向量化客户端
     * @param userId 用户ID
     * @returns boolean 是否有已登录的客户端
     */
    public hasLoggedInClient(userId: number): boolean {
        for (const client of this.clients.values()) {
            if (client.isLoggedIn && client.userId === userId) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取已登录的向量化客户端数量
     * @returns number 已登录客户端数量
     */
    public getLoggedInClientCount(): number {
        return Array.from(this.clients.values()).filter((client) => client.isLoggedIn).length;
    }

    /**
     * 获取指定用户的所有已登录向量化客户端
     * @param userId 用户ID
     * @returns EmbeddingClient[] 该用户的客户端列表
     */
    public getUserClients(userId: number): EmbeddingClient[] {
        return Array.from(this.clients.values()).filter((client) => client.isLoggedIn && client.userId === userId);
    }

    /**
     * 销毁客户端管理器
     */
    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        // 断开所有客户端
        for (const client of this.clients.values()) {
            client.socket.disconnect(true);
        }
        this.clients.clear();
    }
}

// 导出类型定义
export type { EmbeddingClient };
