export const log = (...items: any[]) => {
    console.log(`[${new Date()}]`, items);
};

export const logError = (...items: any[]) => {
    console.error(`[ERROR: ${new Date()}]`, items);
};
