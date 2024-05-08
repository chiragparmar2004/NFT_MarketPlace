import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils/GetIPFSPinataURL";

function NFTTile({ tokenId, isListed }) {
  const [tokenData, setTokenData] = useState(null);
  const [price, setPrice] = useState(null);
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    async function fetchTokenData() {
      try {
        // Fetch token URI from the contract
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        let contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const tokenURI = await contract.tokenURI(tokenId);
        // Fetch NFT metadata from the fetched token URI
        const responsefromIPFs = await GetIpfsUrlFromPinata(tokenURI);
        const finalData = await axios.get(responsefromIPFs);
        setTokenData(finalData.data);

        if (isListed) {
          // Fetch listed token details if NFT is listed
          const [, , seller, _price] = await contract.getListedTokenDetails(
            tokenId
          );
          const formattedPrice = ethers.utils.formatUnits(
            _price.toString(),
            "ether"
          );
          setPrice(formattedPrice);
          setOwner(
            seller.substring(0, 6) + "..." + seller.substring(seller.length - 4)
          );
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    }

    fetchTokenData();
  }, [tokenId]);

  if (!tokenData) {
    return <div>Loading...</div>;
  }

  const newTo = {
    pathname: isListed
      ? "/listedNFTPage/" + tokenId
      : "/unlistedNFTPage/" + tokenId,
  };

  const IPFSUrl = GetIpfsUrlFromPinata(tokenData.image);

  return (
    <Link to={newTo}>
      <div className="border-2 border-black rounded-2xl ml-12 mt-5 mb-12 flex flex-col items-center  w-48 md:w-72 shadow-2xl">
        <div>
          <img
            src={IPFSUrl}
            alt=""
            className="w-72 h-80 rounded-t-2xl object-fill"
            crossOrigin="anonymous"
          />
        </div>

        <div className=" bg-black/20 rounded-b-2xl   w-full p-2  pt-5 ">
          <strong className="text-xl items-center mb-5">
            {tokenData.title}
          </strong>
          {isListed && (
            <div className="flex flex-col ">
              <div>Price: {price} ETH</div>
              <div>Owner: {owner}</div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default NFTTile;
