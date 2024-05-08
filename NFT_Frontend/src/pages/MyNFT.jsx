// import { useState, useEffect } from "react";
// import { readContract } from "@wagmi/core";
// import NFTTile from "../components/NFTTile";
// import { contractABI, contractAddress } from "../utils/constant";

// import { config } from "../../config";
// import { ethers } from "ethers";
// import axios from "axios";

// const MyNFT = () => {
//   const [data, setData] = useState();
//   const [isLoading, setIsLoading] = useState(false); // Add loading state

//   useEffect(() => {
//     setIsLoading(true); // Set loading state to true before fetching data
//     getMYNFT();
//   }, []);

//   async function getMYNFT() {
//     try {
//       let sumPrice = 0;
//       const provider = new ethers.providers.Web3Provider(window.ethereum);
//       const signer = provider.getSigner();
//       const addr = await signer.getAddress();

//       //Pull the deployed contract instance
//       let contract = new ethers.Contract(contractAddress, contractABI, signer);

//       //create an NFT Token
//       let transaction = await contract.getMyUnlistedToken();

//       if (!transaction) {
//         console.log("You don't own tokens");
//       }

//       console.log(transaction);

//       console.log("helo");
//     } catch (error) {
//       console.error("Error fetching contract data:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <div>
//       <div className="flex flex-col place-items-center mt-20">
//         <div className="md:text-xl font-bold text-white">Top NFTs</div>
//         <div className="h-[100% ] flex mt-5 justify-between flex-wrap max-w-screen-xl text-center bg-black"></div>
//       </div>
//     </div>
//   );
// };
// export default MyNFT;
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";
import NFTTile from "../components/NFTTile";

const MyNFT = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [unlistedTokens, setUnlistedTokens] = useState([]);
  const [listedTokens, setListedTokens] = useState([]);

  useEffect(() => {
    setIsLoading(true);
    getMyNFTs();
  }, []);

  async function getMyNFTs() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      // const addr = await signer.getAddress();
      let contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Fetch unlisted tokens
      let unlisted = await contract.getMyUnlistedToken();
      console.log(unlisted, "unlisted");
      setUnlistedTokens(unlisted);

      // Fetch listed tokens
      let listed = await contract.getMyListedToken();
      console.log(listed, "listed");

      setListedTokens(listed);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="h-[100%] flex flex-col place-items-center mt-10 ">
        <div className="flex flex-col text-center">
          <h1 className="text-5xl">Owned NFTs</h1>
          <div className="w-full flex mt-5 justify-between flex-wrap max-w-screen-xl text-center mb-5 ">
            {unlistedTokens.length === 0 ? (
              <div>You don't own any unlisted tokens</div>
            ) : (
              unlistedTokens.map((tokenId) => (
                <NFTTile key={tokenId} tokenId={tokenId} />
              ))
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <h1 className="text-5xl">Listed NFTs</h1>
          <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center ">
            {listedTokens.length === 0 ? (
              <p>You haven't listed any token yet</p>
            ) : (
              listedTokens.map((tokenId) => (
                <NFTTile key={tokenId} tokenId={tokenId} isListed={true} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyNFT;
