import Redis from 'ioredis';

const config = {
    port: 6379, // Redis port
    host: process.env.REDIS_HOST || '127.0.0.1',
};

export const redis = new Redis(config);
