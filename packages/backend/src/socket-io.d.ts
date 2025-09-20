declare interface ServerListenEventMap {
    login: (
        userInfo: { name: string; passwordHash: string },
        callback: (success: boolean, message?: string) => void,
    ) => void;
    keepalive: (callback: () => void) => void;
}

declare interface ServerEmitEventMap {
    task: (texts: string[], callback: (embeddings: number[][]) => void) => void;
}
