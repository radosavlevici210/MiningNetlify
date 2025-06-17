// Elite Mining Pools Configuration
export interface PoolConfig {
  name: string;
  url: string;
  region: string;
  fees: number;
  latency: number;
  reliability: number;
}

export const ELITE_MINING_POOLS: PoolConfig[] = [
  // 2Miners - Primary production pools
  {
    name: '2Miners ETC',
    url: 'etc.2miners.com:1010',
    region: 'Global',
    fees: 1.0,
    latency: 18,
    reliability: 99.8
  },
  {
    name: '2Miners ETC SSL',
    url: 'etc.2miners.com:11010',
    region: 'Global',
    fees: 1.0,
    latency: 20,
    reliability: 99.8
  },
  // Nanopool - Premium performance
  {
    name: 'Nanopool EU',
    url: 'etc-eu1.nanopool.org:19999',
    region: 'Europe',
    fees: 1.0,
    latency: 15,
    reliability: 99.9
  },
  {
    name: 'Nanopool US East',
    url: 'etc-us-east1.nanopool.org:19999',
    region: 'US East',
    fees: 1.0,
    latency: 20,
    reliability: 99.9
  },
  {
    name: 'Nanopool Asia',
    url: 'etc-asia1.nanopool.org:19999',
    region: 'Asia',
    fees: 1.0,
    latency: 25,
    reliability: 99.8
  },
  // Ethermine - Premium production
  {
    name: 'Ethermine ETC EU',
    url: 'etc-eu1.ethermine.org:4444',
    region: 'Europe',
    fees: 1.0,
    latency: 16,
    reliability: 99.8
  },
  {
    name: 'Ethermine ETC US',
    url: 'etc-us-east1.ethermine.org:4444',
    region: 'US East',
    fees: 1.0,
    latency: 22,
    reliability: 99.8
  },
  // F2Pool - Enterprise grade
  {
    name: 'F2Pool ETC',
    url: 'etc.f2pool.com:8118',
    region: 'Global',
    fees: 2.5,
    latency: 25,
    reliability: 99.6
  },
  // Hiveon - Zero fees
  {
    name: 'Hiveon ETC',
    url: 'etc.hiveon.net:4444',
    region: 'Global',
    fees: 0.0,
    latency: 30,
    reliability: 99.5
  },
  // Flexpool - Low fees
  {
    name: 'Flexpool ETC US',
    url: 'etc-us.flexpool.io:4444',
    region: 'US',
    fees: 0.5,
    latency: 28,
    reliability: 99.4
  },
  {
    name: 'Flexpool ETC EU',
    url: 'etc-eu.flexpool.io:4444',
    region: 'Europe',
    fees: 0.5,
    latency: 24,
    reliability: 99.4
  },
  // HeroMiners - Backup pools
  {
    name: 'HeroMiners ETC',
    url: 'etc.herominers.com:1145',
    region: 'Global',
    fees: 0.9,
    latency: 35,
    reliability: 99.2
  },
  // ViaBTC - Additional option
  {
    name: 'ViaBTC ETC',
    url: 'etc.viabtc.com:4444',
    region: 'Global',
    fees: 1.0,
    latency: 40,
    reliability: 99.1
  }
];

export function getBestPool(): PoolConfig {
  // Return the pool with best performance ratio (prioritize reliability and low latency)
  return ELITE_MINING_POOLS.sort((a, b) => {
    const scoreA = (a.reliability / 100) * (1000 / (a.latency + 1)) * (100 / (a.fees + 1));
    const scoreB = (b.reliability / 100) * (1000 / (b.latency + 1)) * (100 / (b.fees + 1));
    return scoreB - scoreA;
  })[0];
}

export function getPoolsByRegion(region: string): PoolConfig[] {
  return ELITE_MINING_POOLS.filter(pool => 
    pool.region.toLowerCase().includes(region.toLowerCase()) || 
    pool.region === 'Global'
  );
}