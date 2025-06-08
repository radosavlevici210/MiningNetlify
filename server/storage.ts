import { 
  users, 
  type User, 
  type InsertUser,
  miningConfigurations,
  type MiningConfiguration,
  type InsertMiningConfiguration,
  miningStats,
  type MiningStats,
  type InsertMiningStats,
  poolConnections,
  type PoolConnection,
  type InsertPoolConnection
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Mining Configuration methods
  getAllMiningConfigurations(): Promise<MiningConfiguration[]>;
  getMiningConfiguration(id: number): Promise<MiningConfiguration | undefined>;
  createMiningConfiguration(config: InsertMiningConfiguration): Promise<MiningConfiguration>;
  updateMiningConfiguration(id: number, config: Partial<InsertMiningConfiguration>): Promise<MiningConfiguration | undefined>;
  deleteMiningConfiguration(id: number): Promise<boolean>;
  
  // Mining Stats methods
  getMiningStats(configId?: number, limit?: number): Promise<MiningStats[]>;
  createMiningStats(stats: InsertMiningStats): Promise<MiningStats>;
  
  // Pool Connection methods
  getPoolConnections(configId?: number): Promise<PoolConnection[]>;
  createPoolConnection(pool: InsertPoolConnection): Promise<PoolConnection>;
  updatePoolConnection(id: number, pool: Partial<InsertPoolConnection>): Promise<PoolConnection | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Mining Configuration methods
  async getAllMiningConfigurations(): Promise<MiningConfiguration[]> {
    const { db } = await import("./db");
    return await db.select().from(miningConfigurations).orderBy(miningConfigurations.createdAt);
  }

  async getMiningConfiguration(id: number): Promise<MiningConfiguration | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [config] = await db.select().from(miningConfigurations).where(eq(miningConfigurations.id, id));
    return config || undefined;
  }

  async createMiningConfiguration(config: InsertMiningConfiguration): Promise<MiningConfiguration> {
    const { db } = await import("./db");
    const [miningConfig] = await db.insert(miningConfigurations).values(config).returning();
    return miningConfig;
  }

  async updateMiningConfiguration(id: number, config: Partial<InsertMiningConfiguration>): Promise<MiningConfiguration | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(miningConfigurations)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(miningConfigurations.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMiningConfiguration(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const result = await db.delete(miningConfigurations).where(eq(miningConfigurations.id, id));
    return result.rowCount > 0;
  }

  // Mining Stats methods
  async getMiningStats(configId?: number, limit = 100): Promise<MiningStats[]> {
    const { db } = await import("./db");
    const { eq, desc } = await import("drizzle-orm");
    
    let query = db.select().from(miningStats);
    
    if (configId !== undefined) {
      query = query.where(eq(miningStats.configId, configId));
    }
    
    return await query.orderBy(desc(miningStats.timestamp)).limit(limit);
  }

  async createMiningStats(stats: InsertMiningStats): Promise<MiningStats> {
    const { db } = await import("./db");
    const [miningStatsRecord] = await db.insert(miningStats).values(stats).returning();
    return miningStatsRecord;
  }

  // Pool Connection methods
  async getPoolConnections(configId?: number): Promise<PoolConnection[]> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    
    let query = db.select().from(poolConnections);
    
    if (configId !== undefined) {
      query = query.where(eq(poolConnections.configId, configId));
    }
    
    return await query.orderBy(poolConnections.createdAt);
  }

  async createPoolConnection(pool: InsertPoolConnection): Promise<PoolConnection> {
    const { db } = await import("./db");
    const [poolConnection] = await db.insert(poolConnections).values(pool).returning();
    return poolConnection;
  }

  async updatePoolConnection(id: number, pool: Partial<InsertPoolConnection>): Promise<PoolConnection | undefined> {
    const { db } = await import("./db");
    const { eq } = await import("drizzle-orm");
    const [updated] = await db
      .update(poolConnections)
      .set(pool)
      .where(eq(poolConnections.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
