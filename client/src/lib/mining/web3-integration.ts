import Web3 from 'web3';

export class Web3Integration {
  private web3: Web3 | null = null;
  private provider: any = null;

  constructor() {
    this.initializeWeb3();
  }

  private async initializeWeb3() {
    try {
      // Check if MetaMask is available
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.provider = (window as any).ethereum;
        this.web3 = new Web3(this.provider);
        
        // Request account access
        await this.provider.request({ method: 'eth_requestAccounts' });
        console.log('Web3 initialized with MetaMask');
      } else {
        // Fallback to HTTP provider
        const rpcUrl = process.env.VITE_ETHEREUM_RPC_URL || 'https://cloudflare-eth.com';
        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
        console.log('Web3 initialized with HTTP provider');
      }
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      const balance = await this.web3.eth.getBalance(address);
      return this.web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error('Failed to fetch balance');
    }
  }

  async getBlockNumber(): Promise<number> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      return await this.web3.eth.getBlockNumber();
    } catch (error) {
      console.error('Failed to get block number:', error);
      throw new Error('Failed to fetch block number');
    }
  }

  async getGasPrice(): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      const gasPrice = await this.web3.eth.getGasPrice();
      return this.web3.utils.fromWei(gasPrice, 'gwei');
    } catch (error) {
      console.error('Failed to get gas price:', error);
      throw new Error('Failed to fetch gas price');
    }
  }

  async getNetworkId(): Promise<number> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      return await this.web3.eth.net.getId();
    } catch (error) {
      console.error('Failed to get network ID:', error);
      throw new Error('Failed to fetch network ID');
    }
  }

  async estimateGas(transaction: any): Promise<number> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      return await this.web3.eth.estimateGas(transaction);
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      throw new Error('Failed to estimate gas');
    }
  }

  async sendTransaction(transaction: any): Promise<string> {
    if (!this.web3 || !this.provider) {
      throw new Error('Web3 or provider not available');
    }

    try {
      const result = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [transaction],
      });
      return result;
    } catch (error) {
      console.error('Failed to send transaction:', error);
      throw new Error('Failed to send transaction');
    }
  }

  async getTransactionReceipt(txHash: string): Promise<any> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      return await this.web3.eth.getTransactionReceipt(txHash);
    } catch (error) {
      console.error('Failed to get transaction receipt:', error);
      throw new Error('Failed to get transaction receipt');
    }
  }

  isConnected(): boolean {
    return this.web3 !== null;
  }

  getAccounts(): Promise<string[]> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    return this.web3.eth.getAccounts();
  }

  utils() {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    return this.web3.utils;
  }
}

export const web3Integration = new Web3Integration();
