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
  // Nanopool - Premium performance
  {
    name: 'Nanopool EU',
    url: 'stratum+tcp://etc-eu1.nanopool.org:19999',
    region: 'Europe',
    fees: 1.0,
    latency: 15,
    reliability: 99.9
  },
  {
    name: 'Nanopool US East',
    url: 'stratum+tcp://etc-us-east1.nanopool.org:19999',
    region: 'US East',
    fees: 1.0,
    latency: 20,
    reliability: 99.9
  },
  {
    name: 'Nanopool Asia',
    url: 'stratum+tcp://etc-asia1.nanopool.org:19999',
    region: 'Asia',
    fees: 1.0,
    latency: 25,
    reliability: 99.8
  },
  // 2Miners - High performance
  {
    name: '2Miners',
    url: 'stratum+tcp://etc.2miners.com:1010',
    region: 'Global',
    fees: 1.0,
    latency: 18,
    reliability: 99.7
  },
  // F2Pool - Enterprise grade
  {
    name: 'F2Pool EU',
    url: 'stratum+tcp://etc-eu.f2pool.com:8118',
    region: 'Europe',
    fees: 2.5,
    latency: 22,
    reliability: 99.6
  },
  {
    name: 'F2Pool US',
    url: 'stratum+tcp://etc-us.f2pool.com:8118',
    region: 'US',
    fees: 2.5,
    latency: 25,
    reliability: 99.6
  },
  // Ethermine - Premium
  {
    name: 'Ethermine',
    url: 'stratum+tcp://etc.ethermine.org:4444',
    region: 'Global',
    fees: 1.0,
    latency: 20,
    reliability: 99.8
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