import { makeAutoObservable } from 'mobx';

class WalletStore {
  bitcoinWalletAddress: string = '';
  polygonWalletAddress: string = '';
  bitcoinWalletData:any="";
  error: string = '';
  transactions: { network: 'bitcoin' | 'polygon'; id: any; receiver: string; amount: string; status: string; fee: number; link: string }[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setWalletAddress(network: 'bitcoin' | 'polygon', address: string) {
    if (network === 'bitcoin') {
      this.bitcoinWalletAddress = address;
    } else if (network === 'polygon') {
      this.polygonWalletAddress = address;
    }
  }
  setWalletData(network: 'bitcoin' | 'polygon', data: string){
    if(network==="bitcoin"){
      this.bitcoinWalletData=data
    }
  }
  addTransaction(transaction: { network: 'bitcoin' | 'polygon'; id: any; receiver: string; amount: string; status: string; fee: number; link: string }) {
    this.transactions.push(transaction);
  }

  setError(error: string) {
    this.error = error;
  }

  clearError() {
    this.error = '';
  }
}

export const walletStore = new WalletStore();
