import { useCallback, useEffect, useState } from "react";
import web3ModalSetup from "./../helpers/web3ModalSetup";
import Web3 from "web3";
import getAbi from "../Abi";
import logo from "./../assets/logo.webp";
import {networkChainId} from "./../helpers/web3ModalSetup";
// import { CONTRACTADDR } from "../Abi";

const web3Modal = web3ModalSetup();
// eslint-disable-next-lines
const Interface = () => {
  const [Abi, setAbi] = useState();
  const [web3, setWeb3] = useState();
  const [isConnected, setIsConnected] = useState(false);
  const [injectedProvider, setInjectedProvider] = useState();
  const [refetch, setRefetch] = useState(true);
  const [current, setCurrent] = useState(null);
  const [connButtonText, setConnButtonText] = useState("CONNECT");
  const [tradingState, setTradingState] = useState(false);
  const [jeetState, setJeetState] = useState(false);
  const [jeetPreventTime, setJeetProventTime] = useState(0);
  const [blockTime, setBlockTime] = useState(0);
  const [currentChainId, setCurrentChainId] = useState("");
  const [timer, setTimer] = useState('00:00');
  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (
      injectedProvider &&
      injectedProvider.provider &&
      typeof injectedProvider.provider.disconnect == "function"
    ) {
      await injectedProvider.provider.disconnect();
    }
    setIsConnected(false);

    window.location.reload();
  };
  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3(provider));
    const acc = provider.selectedAddress
      ? provider.selectedAddress
      : provider.accounts[0];

    const short = shortenAddr(acc);
    setWeb3(new Web3(provider));
    setAbi(await getAbi(new Web3(provider)));

    setCurrent(acc);
    setIsConnected(true);

    setConnButtonText(short);

    provider.on("chainChanged", (chainId) => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new Web3(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new Web3(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
    // eslint-disable-next-line
  }, [setInjectedProvider]);

  useEffect(() => {
    setInterval(() => {
      setRefetch((prevRefetch) => {
        return !prevRefetch;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
    // eslint-disable-next-line
  }, []);

  const shortenAddr = (addr) => {
    if (!addr) return "";
    const first = addr.substr(0, 3);
    const last = addr.substr(38, 41);
    return first + "..." + last;
  };

  useEffect(() => {
    const AbiContract = async () => {
      if (!isConnected || !web3) return;
      const _currentChainId = await web3.eth.getChainId();
      setCurrentChainId(_currentChainId);
      if (_currentChainId === networkChainId) {
        const _trandingState = await Abi.methods.tradingState().call();
        setTradingState(_trandingState);
        const _jeetState = await Abi.methods.getJeetState().call();
        setJeetState(_jeetState);
        const _jeetPreventTime = await Abi.methods.jeetPreventTime.call();
        setJeetProventTime(_jeetPreventTime);
        const _blockTime =  await Abi.methods.getTimeStamp.call();
        setBlockTime(_blockTime);
      }
    };

    AbiContract();
  }, [isConnected, web3, Abi, refetch]);

  useEffect(() => {
    const jeetTimer = async() => {
      if(jeetState) return;
      const restartTime = jeetPreventTime - blockTime;
      if(restartTime > 0) {
        startTimer(restartTime);
      }
    }
    jeetTimer();
  }, [refetch])
  const getTimeRemaining = (time) => {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time % 60);
    return {
      minutes, seconds
    };
  }

  const startTimer = (time) => {
    let { minutes, seconds }
      = getTimeRemaining(time);
    if (time >= 0) {
      setTimer(
        (minutes > 9 ? minutes : '0' + minutes) + ':'
        + (seconds > 9 ? seconds : '0' + seconds)
      )
    }
  }

  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-dark" style={{ background: "black" }}>
        <div className="container-fluid">
          <ul></ul>
          <button className="btn btn-primary btn-lg btnd" style={{ background: "yellow", color: "black", border: "1px solid #fff" }} onClick={loadWeb3Modal}><i className="fas fa-wallet"></i> {connButtonText}</button>
        </div>
      </nav>
      <br />
      <div className="container" style={{ textAlign: "center" }}>
        <img src={logo} className="logo-img" />
        <br />
        <br />
        <br />
        <div className="social-icons">
          <div className="col-md-4">
            <a className="elementor-icon" href="https://t.me/JeetDemon" target="_blank" style={{ textDecoration: "none" }}>
              <i aria-hidden="true" className="fa fa-telegram"></i>
            </a>
          </div>
          <div className="col-md-4">
            <a className="elementor-icon" href="https://twitter.com/Naita_Aka_Oni" target="_blank" style={{ textDecoration: "none" }}>
              <i aria-hidden="true" className="fa fa-twitter"></i>
            </a>
          </div>
          <div className="col-md-4">
            <a className="elementor-icon" href="https://medium.com/@jeetdemon/pump-dump-no-more-with-the-new-eth-2-0-anti-jeet-erc20-standard-19fe0862d724" target="_blank" style={{ textDecoration: "none" }}>
              <i aria-hidden="true" className="fa fa-medium"></i>
            </a>
          </div>
        </div>
        <br />
        <br />
        <h2 className="elementor-heading-title elementor-size-default">Website Opening Soon</h2>
      </div>

      <div style={{ textAlign: "center" }}>
        <div className="state-content">
          {isConnected ? (
            currentChainId === networkChainId ? (
              <>
                <div className={`state-icon ${tradingState ? jeetState ? "active-icon" : "inactive-icon" : "before-icon"}`} />
                <div className="state-div">
                  {tradingState ? <p className="state-statement">Active Selling!</p> : <p className="state-statement">Coming Soon!</p>}
                </div>
              </>
            ) : <p className="connection-state">Please change network!</p>
          ) :
            <p className="connection-state">Please connect MetaMask!</p>}
        </div>
        <div className="count-down">
          {(tradingState && !jeetState) ? (
            <h2>{timer}</h2>
          ) : ""}
        </div>
      </div>

    </>
  );
}

export default Interface;
