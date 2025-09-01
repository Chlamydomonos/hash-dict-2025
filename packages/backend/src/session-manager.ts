import { Transaction } from '@sequelize/core';
import { User } from './db/models/User';
import crypto from 'crypto';

const sessionExpireTime = 30; // 30分钟后session过期

interface SessionData {
    userId: number;
    username: string;
    createdAt: Date;
    lastAccessed: Date;
}

export enum LoginResult {
    SUCCESS = 'success',
    USER_NOT_FOUND = 'user_not_found',
    INVALID_PASSWORD = 'invalid_password',
    USER_INVALID = 'user_invalid',
    INTERNAL_ERROR = 'internal_error',
}

export interface LoginResponse {
    result: LoginResult;
    token?: string;
    message?: string;
}

class SessionManager {
    private sessions: Map<string, SessionData> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // 每5分钟清理一次过期的session
        this.cleanupInterval = setInterval(
            () => {
                this.cleanupExpiredSessions();
            },
            5 * 60 * 1000,
        );
    }

    /**
     * 生成32位随机base64字符串作为session token
     */
    private generateSessionToken(): string {
        return crypto.randomBytes(24).toString('base64'); // 24 bytes * 4/3 = 32 characters
    }

    /**
     * 清理过期的session
     */
    private cleanupExpiredSessions(): void {
        const now = new Date();
        for (const [token, session] of this.sessions.entries()) {
            if (this.isSessionExpired(session, now)) {
                this.sessions.delete(token);
            }
        }
    }

    /**
     * 检查session是否已过期
     */
    private isSessionExpired(session: SessionData, now: Date = new Date()): boolean {
        const expireTime = new Date(session.lastAccessed.getTime() + sessionExpireTime * 60 * 1000);
        return now > expireTime;
    }

    /**
     * 用户登录
     * @param username 用户名
     * @param passwordHash 密码哈希值
     * @returns 登录结果，包含结果状态和可能的token
     */
    async login(username: string, passwordHash: string, transaction?: Transaction): Promise<LoginResponse> {
        try {
            // 首先查找用户名是否存在
            const userByName = await User.findOne({
                where: {
                    name: username,
                },
                transaction,
            });

            if (!userByName) {
                return {
                    result: LoginResult.USER_NOT_FOUND,
                    message: '用户不存在',
                };
            }

            // 检查用户是否有效
            if (!userByName.valid) {
                return {
                    result: LoginResult.USER_INVALID,
                    message: '用户账户已被禁用',
                };
            }

            // 验证密码
            if (userByName.passwordHash !== passwordHash) {
                return {
                    result: LoginResult.INVALID_PASSWORD,
                    message: '密码错误',
                };
            }

            // 生成session token
            const token = this.generateSessionToken();
            const now = new Date();

            // 存储session数据
            this.sessions.set(token, {
                userId: userByName.id,
                username: userByName.name,
                createdAt: now,
                lastAccessed: now,
            });

            return {
                result: LoginResult.SUCCESS,
                token: token,
                message: '登录成功',
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                result: LoginResult.INTERNAL_ERROR,
                message: '服务器内部错误',
            };
        }
    }

    /**
     * 通过session token验证用户
     * @param token session token
     * @returns 用户信息或null（验证失败）
     */
    validateSession(token: string): { id: number; name: string } | null {
        const session = this.sessions.get(token);

        if (!session) {
            return null; // session不存在
        }

        if (this.isSessionExpired(session)) {
            this.sessions.delete(token); // 删除过期session
            return null;
        }

        // 更新最后访问时间
        session.lastAccessed = new Date();

        return {
            id: session.userId,
            name: session.username,
        };
    }

    /**
     * 用户登出
     * @param token session token
     * @returns 是否成功登出
     */
    logout(token: string): boolean {
        return this.sessions.delete(token);
    }

    /**
     * 获取用户的所有session（用于多设备登录管理）
     * @param userId 用户ID
     * @returns session token数组
     */
    getUserSessions(userId: number): string[] {
        const tokens: string[] = [];
        for (const [token, session] of this.sessions.entries()) {
            if (session.userId === userId && !this.isSessionExpired(session)) {
                tokens.push(token);
            }
        }
        return tokens;
    }

    /**
     * 登出用户的所有session
     * @param userId 用户ID
     * @returns 登出的session数量
     */
    logoutAllUserSessions(userId: number): number {
        let count = 0;
        for (const [token, session] of this.sessions.entries()) {
            if (session.userId === userId) {
                this.sessions.delete(token);
                count++;
            }
        }
        return count;
    }

    /**
     * 获取当前活跃session数量
     */
    getActiveSessionCount(): number {
        this.cleanupExpiredSessions();
        return this.sessions.size;
    }

    /**
     * 销毁session管理器
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        this.sessions.clear();
    }
}

// 导出单例实例
export const sessionManager = new SessionManager();

// 导出类型定义
export type { SessionData };
