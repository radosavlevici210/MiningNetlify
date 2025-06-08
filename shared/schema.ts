import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const miningConfigurations = pgTable("mining_configurations", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  poolUrl: text("pool_url").notNull(),
  workerName: text("worker_name").notNull(),
  chain: text("chain").notNull().default("etc"),
  intensity: integer("intensity").notNull().default(7),
  threadCount: integer("thread_count").notNull().default(4),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const miningStats = pgTable("mining_stats", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").references(() => miningConfigurations.id),
  hashrate: real("hashrate").notNull().default(0),
  sharesAccepted: integer("shares_accepted").notNull().default(0),
  sharesRejected: integer("shares_rejected").notNull().default(0),
  earnings: real("earnings").notNull().default(0),
  uptime: integer("uptime").notNull().default(0),
  temperature: real("temperature").notNull().default(0),
  powerConsumption: real("power_consumption").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const poolConnections = pgTable("pool_connections", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").references(() => miningConfigurations.id),
  poolUrl: text("pool_url").notNull(),
  status: text("status").notNull().default("disconnected"),
  latency: real("latency").notNull().default(0),
  difficulty: text("difficulty"),
  blockHeight: integer("block_height"),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMiningConfigurationSchema = createInsertSchema(miningConfigurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMiningStatsSchema = createInsertSchema(miningStats).omit({
  id: true,
  timestamp: true,
});

export const insertPoolConnectionSchema = createInsertSchema(poolConnections).omit({
  id: true,
  createdAt: true,
});

export type MiningConfiguration = typeof miningConfigurations.$inferSelect;
export type InsertMiningConfiguration = z.infer<typeof insertMiningConfigurationSchema>;
export type MiningStats = typeof miningStats.$inferSelect;
export type InsertMiningStats = z.infer<typeof insertMiningStatsSchema>;
export type PoolConnection = typeof poolConnections.$inferSelect;
export type InsertPoolConnection = z.infer<typeof insertPoolConnectionSchema>;

// User table for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
