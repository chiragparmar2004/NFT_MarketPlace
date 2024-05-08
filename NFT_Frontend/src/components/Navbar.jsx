// Navbar.js
import { Link } from "react-router-dom";

import { ConnectButton } from "@rainbow-me/rainbowkit";

const Navbar = () => {
  // const { sdk, connected, connecting, provider, chainId } = useSDK();

  // const ConnectWallet = async () => {
  //   await window.ethereum.request({ method: "eth_requestAccounts" });
  //   const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  //   // if (provider.network !== "matic") {
  //   //   await window.ethereum.request({
  //   //     method: "wallet_addEthereumChain",
  //   //     params: [
  //   //       {
  //   //         ...networks["polygon"],
  //   //       },
  //   //     ],
  //   //   });
  //   // }

  //   const account = provider.getSigner();
  //   const Address = await account.getAddress();
  //   console.log(Address);
  //   setAddress(Address);
  //   const Balance = ethers.utils.formatEther(await account.getBalance());
  //   console.log(Balance);
  //   setBalance(Balance);
  // };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">
          NFT_MarketPlace
        </Link>
        <div className="text-2xl">
          <Link to="/ExploreMarketPlace" className="text-white mx-4">
            Explore
          </Link>
          <Link to="/CreateNFT" className="text-white mx-4">
            CreateNFT
          </Link>
          <Link to="/MyNFT" className="text-white mx-4">
            MyNFT
          </Link>
        </div>
        <div>
          <ConnectButton />
        </div>
        {/* <ConnectButton />
        <div className=" rounded-lg p-2">
          {connected ? (
            <div className="flex flex-row gap-2  bg-white p-1 rounded-full items-center">
              <p className="text-black font-bold text-xl">{`${balance} ETH`}</p>
              {
                <h2 className="text-white bg-slate-500 p-1 font-bold text-xl  rounded-full">
                  {trimAddr}
                </h2>
              }
            </div>
          ) : (
            <button
              className="text-white px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600"
              onClick={ConnectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div> */}
        {/* <div className=" rounded-lg p-2">
          {address === "" && balance === "" ? (
            <button
              className="text-white px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600"
              onClick={connect}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex flex-row gap-2  bg-white p-1 rounded-full items-center">
              <p className="text-black font-bold text-lg">
                {balance === "" ? "" : `${balance.slice(0, 4)} ETH`}
              </p>
              {address ? (
                <h2 className="text-white bg-slate-500 p-1 font-bold text-lg  rounded-full">
                  {account && `Connected account: ${account}`}
                </h2>
              ) : null}
            </div>
          )}
        </div> */}
      </div>
    </nav>
  );
};

export default Navbar;
