import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils/GetIPFSPinataURL";
import NFTTile from "../components/NFTTile";

export default function ExploreMarketPlace() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  useEffect(() => {
    setIsLoading(true); // Set loading state to true before fetching data
    getAllNFT();
  }, []);

  async function getAllNFT() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      const listedNFTs = await contract.getAllListedNFTs();
      console.log(listedNFTs);

      if (!listedNFTs || listedNFTs.length === 0) {
        throw new Error("No listed NFTs found");
      }

      // Fetch token URI for each listed NFT
      const nftData = await Promise.all(
        listedNFTs.map(async (tokenId) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const responseFromIPFS = await GetIpfsUrlFromPinata(tokenURI);

          // Fetch additional metadata if needed
          const metadataResponse = await axios.get(responseFromIPFS);
          const { image, title } = metadataResponse.data;

          return {
            tokenId,
            image,
            title,
          };
        })
      );

      setData(nftData);
    } catch (error) {
      console.error("Error fetching contract data:", error);
    } finally {
      setIsLoading(false); // Set loading state to false after fetching data (success or failure)
    }
  }

  return (
    <div>
      <div className="flex flex-col place-items-center mt-20">
        <div className="text-3xl font-bold  ">Explore NFTs</div>
        <div className="flex mt-5 justify-between flex-wrap max-w-screen-xl text-center">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            data.map((nft, index) => (
              <NFTTile tokenId={nft.tokenId} isListed={true} key={index} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
