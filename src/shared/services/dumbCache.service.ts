// TODO: Replace with Redis or similar

class DumbCacheService {
  private cache: Map<string, { data: Buffer; timestamp: number }> = new Map();

  constructor() {
    setInterval(() => this.cleanup(), 1000 * 60); // 1m
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, { timestamp }] of this.cache) {
      if (timestamp < now) {
        this.cache.delete(key);
      }
    }
  }

  public has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  public set(key: string, data: Buffer, ttl: number) {
    const timestamp = Date.now() + ttl;
    this.cache.set(key, { data, timestamp });
  }

  public get(key: string): Buffer | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public delete(key: string) {
    this.cache.delete(key);
  }

  public flush() {
    this.cache.clear();
  }
}

export { DumbCacheService };
