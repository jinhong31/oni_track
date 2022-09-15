import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";
// export const networkChainId = 0x1;
export const networkChainId = 0x5;
/**
  Web3 modal helps us "connect" external wallets:
**/
const web3ModalSetup = () =>
  new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            // 1: "https://mainnet.infura.io/v3/"
            5: "https://goerli.infura.io/v3/"
          },
        },
      },
    },
  });

export default web3ModalSetup;
