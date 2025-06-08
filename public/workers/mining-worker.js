// Mining Worker for Ethash computation
let isRunning = false;
let nonce = Math.floor(Math.random() * 0xFFFFFFFF);
let job = null;
let intensity = 5;
let workerId = 0;
let hashCount = 0;
let lastHashrateReport = Date.now();

// Simulated Ethash computation - in production this would use WebAssembly
function simulateEthashComputation(headerHash, nonce, difficulty) {
  // This is a placeholder for actual Ethash computation
  // In production, you would call the WebAssembly Ethash implementation
  
  // Simulate computational work
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += Math.floor(Math.random() * 16).toString(16);
  }
  
  // Generate mix hash
  let mixHash = '';
  for (let i = 0; i < 64; i++) {
    mixHash += Math.floor(Math.random() * 16).toString(16);
  }
  
  // Check if meets target (simulate finding shares occasionally)
  const meetsTarget = Math.random() < 0.0001; // Very low probability
  
  return {
    hash: '0x' + hash,
    mixHash: '0x' + mixHash,
    meetsTarget,
    nonce
  };
}

function mine() {
  if (!isRunning || !job) return;
  
  const batchSize = intensity * 1000; // Adjust batch size based on intensity
  const startTime = Date.now();
  
  for (let i = 0; i < batchSize && isRunning; i++) {
    nonce++;
    hashCount++;
    
    // Perform Ethash computation
    const result = simulateEthashComputation(job.headerHash, nonce, job.difficulty);
    
    // Check if we found a valid share
    if (result.meetsTarget) {
      self.postMessage({
        type: 'share',
        data: {
          nonce: result.nonce.toString(16),
          hash: result.hash,
          mixHash: result.mixHash,
          workerId
        }
      });
    }
  }
  
  // Report hashrate every 2 seconds
  const now = Date.now();
  if (now - lastHashrateReport >= 2000) {
    const timeElapsed = (now - lastHashrateReport) / 1000;
    const hashrate = hashCount / timeElapsed;
    
    self.postMessage({
      type: 'hashrate',
      data: {
        rate: hashrate,
        workerId
      }
    });
    
    hashCount = 0;
    lastHashrateReport = now;
  }
  
  // Continue mining
  setTimeout(mine, 10); // Small delay to prevent blocking
}

// Handle messages from main thread
self.onmessage = function(event) {
  const { type, data } = event.data;
  
  switch (type) {
    case 'start':
      job = data.job;
      workerId = data.workerId || 0;
      intensity = data.intensity || 5;
      isRunning = true;
      lastHashrateReport = Date.now();
      hashCount = 0;
      
      self.postMessage({
        type: 'status',
        data: {
          message: `Worker ${workerId} started mining`,
          workerId
        }
      });
      
      mine();
      break;
      
    case 'stop':
      isRunning = false;
      
      self.postMessage({
        type: 'status',
        data: {
          message: `Worker ${workerId} stopped`,
          workerId
        }
      });
      break;
      
    case 'update_job':
      job = data.job;
      
      self.postMessage({
        type: 'status',
        data: {
          message: `Worker ${workerId} received new job`,
          workerId
        }
      });
      break;
      
    case 'update_intensity':
      intensity = data.intensity || 5;
      
      self.postMessage({
        type: 'status',
        data: {
          message: `Worker ${workerId} intensity updated to ${intensity}`,
          workerId
        }
      });
      break;
      
    default:
      self.postMessage({
        type: 'error',
        data: {
          message: `Unknown command: ${type}`,
          workerId
        }
      });
  }
};

// Handle worker errors
self.onerror = function(error) {
  self.postMessage({
    type: 'error',
    data: {
      message: `Worker error: ${error.message}`,
      workerId
    }
  });
};
