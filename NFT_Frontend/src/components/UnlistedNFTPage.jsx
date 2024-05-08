import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils/GetIPFSPinataURL";
import { toast } from "react-toastify";

function UnlistedNFTPage() {
  const { tokenId } = useParams();
  const [nftData, setNFTData] = useState(null);
  const [price, setPrice] = useState("");
  const [floorPrice, setFloorPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchNFTData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      const tokenURI = await contract.tokenURI(tokenId);
      const responsefromIPFs = await GetIpfsUrlFromPinata(tokenURI);
      const response = await axios.get(responsefromIPFs);
      setNFTData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNFTData();
  }, []);

  const listTokenAndStartAuction = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Call both listToken and startAuction functions
      await contract.listToken(tokenId, ethers.utils.parseEther(price));
      await contract.startAuction(
        tokenId,
        ethers.utils.parseEther(floorPrice),
        duration
      );

      toast.success("Successfully listed your NFT!");

      setTimeout(() => {
        window.location.replace("/ExploreMarketPlace");
      }, 2000);
    } catch (error) {
      console.error("Error listing token and starting auction:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <img
          className="w-full h-64 object-cover object-center"
          src={nftData.image}
          alt={nftData.name}
        />
        <div className="py-4 px-6">
          <h2 className="text-2xl font-bold text-gray-800">{nftData.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{nftData.description}</p>
          <div className="mt-4">
            <input
              className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:border-blue-500"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />

            <div className="mt-4">
              <input
                className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:border-blue-500"
                type="text"
                value={floorPrice}
                onChange={(e) => setFloorPrice(e.target.value)}
                placeholder="Enter floor price"
              />
              <input
                className="border border-gray-300 rounded-md px-3 py-2 w-full mt-2 focus:outline-none focus:border-blue-500"
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration (in seconds)"
              />
            </div>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
              onClick={() => listTokenAndStartAuction()}
            >
              List for Sale and Start Auction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnlistedNFTPage;
