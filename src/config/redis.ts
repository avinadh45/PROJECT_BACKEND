const store = new Map<string, string>();

export const redisClient = {
    set: async (key: string, value: string, options?: any) => {
        store.set(key, value);
    },
    get: async (key: string) => {
        return store.get(key) || null;
    },
    del: async (key: string) => {
        store.delete(key);
    },
    connect: async () => {},
    on: (event: string, callback: any) => {
        if(event === "connect") callback();
    }
};

export const connectRedis = async () => {
    console.log("Redis is running");
};