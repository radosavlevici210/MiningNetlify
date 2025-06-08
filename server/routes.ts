import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { 
  insertMiningConfigurationSchema, 
  insertMiningStatsSchema,
  insertPoolConnectionSchema,
  type MiningConfiguration,
  type MiningStats,
  type PoolConnection
} from "@shared/schema";
import { storage } from "./storage";
import { StratumProxy } from "./stratum-proxy";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mining Configuration Routes
  app.get("/api/mining/config", async (req, res) => {
    try {
      const configs = await storage.getAllMiningConfigurations();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mining configurations" });
    }
  });

  app.get("/api/mining/config/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const config = await storage.getMiningConfiguration(id);
      
      if (!config) {
        return res.status(404).json({ error: "Mining configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mining configuration" });
    }
  });

  app.post("/api/mining/config", async (req, res) => {
    try {
      const configData = insertMiningConfigurationSchema.parse(req.body);
      const config = await storage.createMiningConfiguration(configData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create mining configuration" });
    }
  });

  app.put("/api/mining/config/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const configData = insertMiningConfigurationSchema.parse(req.body);
      const config = await storage.updateMiningConfiguration(id, configData);
      
      if (!config) {
        return res.status(404).json({ error: "Mining configuration not found" });
      }
      
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update mining configuration" });
    }
  });

  app.delete("/api/mining/config/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMiningConfiguration(id);
      
      if (!success) {
        return res.status(404).json({ error: "Mining configuration not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mining configuration" });
    }
  });

  // Mining Stats Routes
  app.get("/api/mining/stats", async (req, res) => {
    try {
      const configId = req.query.configId ? parseInt(req.query.configId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      
      const stats = await storage.getMiningStats(configId, limit);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mining stats" });
    }
  });

  app.post("/api/mining/stats", async (req, res) => {
    try {
      const statsData = insertMiningStatsSchema.parse(req.body);
      const stats = await storage.createMiningStats(statsData);
      res.status(201).json(stats);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid stats data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create mining stats" });
    }
  });

  // Pool Connection Routes
  app.get("/api/mining/pools", async (req, res) => {
    try {
      const configId = req.query.configId ? parseInt(req.query.configId as string) : undefined;
      const pools = await storage.getPoolConnections(configId);
      res.json(pools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pool connections" });
    }
  });

  app.post("/api/mining/pools", async (req, res) => {
    try {
      const poolData = insertPoolConnectionSchema.parse(req.body);
      const pool = await storage.createPoolConnection(poolData);
      res.status(201).json(pool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid pool data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create pool connection" });
    }
  });

  app.put("/api/mining/pools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const poolData = insertPoolConnectionSchema.parse(req.body);
      const pool = await storage.updatePoolConnection(id, poolData);
      
      if (!pool) {
        return res.status(404).json({ error: "Pool connection not found" });
      }
      
      res.json(pool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid pool data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update pool connection" });
    }
  });

  // Real-time mining data endpoint
  app.get("/api/mining/realtime/:configId", async (req, res) => {
    try {
      const configId = parseInt(req.params.configId);
      const config = await storage.getMiningConfiguration(configId);
      
      if (!config) {
        return res.status(404).json({ error: "Mining configuration not found" });
      }

      // Get latest stats
      const latestStats = await storage.getMiningStats(configId, 1);
      const recentStats = await storage.getMiningStats(configId, 20);

      res.json({
        config,
        currentStats: latestStats[0] || null,
        history: recentStats
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch real-time mining data" });
    }
  });

  // Mining control endpoints
  app.post("/api/mining/start/:configId", async (req, res) => {
    try {
      const configId = parseInt(req.params.configId);
      const config = await storage.getMiningConfiguration(configId);
      
      if (!config) {
        return res.status(404).json({ error: "Mining configuration not found" });
      }

      // Update configuration to active
      await storage.updateMiningConfiguration(configId, { ...config, isActive: true });
      
      res.json({ message: "Mining started successfully", configId });
    } catch (error) {
      res.status(500).json({ error: "Failed to start mining" });
    }
  });

  app.post("/api/mining/stop/:configId", async (req, res) => {
    try {
      const configId = parseInt(req.params.configId);
      const config = await storage.getMiningConfiguration(configId);
      
      if (!config) {
        return res.status(404).json({ error: "Mining configuration not found" });
      }

      // Update configuration to inactive
      await storage.updateMiningConfiguration(configId, { ...config, isActive: false });
      
      res.json({ message: "Mining stopped successfully", configId });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop mining" });
    }
  });

  // Initialize stratum proxy for real mining pool connections
  const httpServer = createServer(app);
  const stratumProxy = new StratumProxy(httpServer);

  // Real-time mining pool endpoints
  app.get("/api/pools/available", async (req, res) => {
    const availablePools = [
      {
        name: "2miners ETC",
        url: "stratum+tcp://etc.2miners.com:1010",
        chain: "etc",
        fee: 1.0,
        minPayout: 0.01,
        status: "online"
      },
      {
        name: "Nanopool ETC", 
        url: "stratum+tcp://etc-eu1.nanopool.org:19999",
        chain: "etc",
        fee: 1.0,
        minPayout: 0.1,
        status: "online"
      },
      {
        name: "F2Pool ETC",
        url: "stratum+tcp://etc.f2pool.com:8118", 
        chain: "etc",
        fee: 2.5,
        minPayout: 0.05,
        status: "online"
      },
      {
        name: "2miners ETHW",
        url: "stratum+tcp://ethw.2miners.com:2020",
        chain: "ethw", 
        fee: 1.0,
        minPayout: 0.01,
        status: "online"
      }
    ];
    res.json(availablePools);
  });

  app.get("/api/network/stats", async (req, res) => {
    try {
      // Real network statistics - in production would fetch from blockchain APIs
      const networkStats = {
        etc: {
          hashrate: "24.7 TH/s",
          difficulty: "348.2 T",
          blockTime: 13.2,
          blockReward: 3.2,
          price: 28.45
        },
        ethw: {
          hashrate: "12.1 TH/s", 
          difficulty: "186.4 T",
          blockTime: 14.1,
          blockReward: 2.0,
          price: 3.82
        }
      };
      res.json(networkStats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch network statistics" });
    }
  });

  console.log(`Stratum proxy initialized with ${stratumProxy.getActiveConnections()} connections`);

  return httpServer;
}
