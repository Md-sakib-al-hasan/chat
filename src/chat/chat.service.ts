// src/redis/redis.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redis: Redis;

  onModuleInit() {
    this.redis = new Redis(process.env.REDIS_CONNECTION_URL|| "redis://red-d108i315pdvs73988kn0:6379" );
  }

  async set(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async hSet(hash: string, key: string, value: string) {
    await this.redis.hset(hash, key, value);
  }

  async hGet(hash: string, key: string) {
    return this.redis.hget(hash, key);
  }

  async hDel(hash: string, key: string) {
    await this.redis.hdel(hash, key);
  }

  async hGetAll(hash: string) {
    return this.redis.hgetall(hash);
  }
}
