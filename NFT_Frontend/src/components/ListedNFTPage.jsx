import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";
import { GetIpfsUrlFromPinata } from "../utils/GetIPFSPinataURL";
import OfferModal from "./OfferModal";
import { toast } from "react-toastify";

function ListedNFTPage() {
  const { tokenId } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [owner, setOwner] = useState(null);
  const [price, setPrice] = useState(null);
  const [bidPrice, setBidPrice] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [bidders, setBidders] = useState([]);
  const [auctionEndTime, setAuctionEndTime] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal

  useEffect(() => {
    async function fetchData() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const tokenURI = await contract.tokenURI(tokenId);
        const responseFromIPFS = await GetIpfsUrlFromPinata(tokenURI);
        const metadata = await axios.get(responseFromIPFS);
        setTokenData(metadata.data);

        const [, _owner, seller, _price] = await contract.getListedTokenDetails(
          tokenId
        );
        setOwner(
          seller.substring(0, 8) + "..." + seller.substring(seller.length - 6)
        );
        setPrice(ethers.utils.formatUnits(_price.toString(), "ether"));

        const [biddersList, bids, timestamps] = await contract.getAllBids(
          tokenId
        );
        console.log(biddersList);

        const biddersData = [];
        for (let i = 0; i < biddersList.length; i++) {
          const bidder = biddersList[i];
          const bidAmount = ethers.utils.formatUnits(
            bids[i].toString(),
            "ether"
          );
          const timestamp = timestamps[i];
          biddersData.push({
            bidder: bidder,
            bidAmount: bidAmount,
            timestamp: timestamp,
          });
        }

        console.log(biddersData);
        setBidders(biddersData);
        const [, , startPrice, , , endTime] = await contract.getAuctionDetails(
          tokenId
        );
        setAuctionEndTime(endTime.toNumber());
        setBidPrice(startPrice);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching token data:", error);
      }
    }

    fetchData();
  }, [tokenId]);

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = auctionEndTime - now;
      if (remaining <= 0) {
        clearInterval(interval);
        // Call endAuction function here
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        contract
          .endAuction(tokenId)
          .then(() => {
            console.log("Auction ended successfully");
          })
          .catch((error) => {
            console.error("Error ending auction:", error);
          });
      }
      setTimeRemaining(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [auctionEndTime]);

  const handleMakeOfferClick = () => {
    setIsModalOpen(true);
  };

  const handleBuyClick = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Call purchaseToken function
      await contract.purchaseToken(tokenId, {
        value: ethers.utils.parseEther(price),
      });
      console.log("Token purchased successfully");
      toast.success("Successfully purchased  NFT!");

      setTimeout(() => {
        window.location.replace("/MyNFT");
      }, 2000);
      // You may want to refresh the page or update the UI after successful purchase
    } catch (error) {
      console.error("Error purchasing token:", error);
    }
  };

  const calculateTimeDifference = (timestamp) => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const timeDifference = currentTime - timestamp;

    // Define time intervals in seconds
    const minute = 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30;
    const year = month * 12;

    // Determine the appropriate time interval and format the time difference
    if (timeDifference < minute) {
      return `${timeDifference} seconds ago`;
    } else if (timeDifference < hour) {
      const minutes = Math.floor(timeDifference / minute);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    } else if (timeDifference < day) {
      const hours = Math.floor(timeDifference / hour);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (timeDifference < month) {
      const days = Math.floor(timeDifference / day);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (timeDifference < year) {
      const months = Math.floor(timeDifference / month);
      return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(timeDifference / year);
      return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
  };

  //   console.log(bidders);
  return (
    <div className="flex justify-center items-center">
      <div className="border border-black rounded-2xl bg-black bg-opacity-10 backdrop-blur-3xl w-[80%] flex px-5 py-5 mt-10 ml-10">
        {/* Left Side */}
        <div className="w-1/2 h-full ">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <>
              <img
                src={GetIpfsUrlFromPinata(tokenData.image)}
                alt="NFT"
                className="w-full rounded-2xl"
              />
              <p className="mt-4 text-wrap text-pretty ">
                {tokenData.description}
              </p>
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="w-1/2 ml-8 flex flex-col gap-7">
          <h1 className="text-5xl font-bold">{tokenData?.title}</h1>
          {/* Auction Timer */}
          <div className="flex items-center gap-10 mt-4">
            <p className="text-2xl text-red-500 ">Auction Ends In:</p>
            <p className="text-2xl text-blue-500 font-semibold">
              {timeRemaining > 0 ? (
                <span>
                  {Math.floor(timeRemaining / 3600)}h{" "}
                  {Math.floor((timeRemaining % 3600) / 60)}m{" "}
                  {timeRemaining % 60}s
                </span>
              ) : (
                "Auction Ended"
              )}
            </p>
          </div>
          {/* End Auction Timer */}
          <p className="mt-2 text-3xl">Price: {price} ETH</p>
          <p className="mt-2 text-lg">Owner: {owner}</p>
          <div className="flex  mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xl py-3 px-6 mr-4 rounded"
              onClick={handleBuyClick}
            >
              Buy
            </button>
            <span className=" flex items-center mr-4 font-bold"> OR </span>
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-bold text-xl py-3 px-6 rounded"
              onClick={handleMakeOfferClick}
            >
              Make Offer
            </button>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Bid History</h2>
            <div className="divide-y divide-black">
              {bidders.map((bidder, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 px-4 rounded-md"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <p className="text-sm font-bold text-gray-600">
                        {bidder.bidder.substring(0, 2).toUpperCase()}
                      </p>
                    </div>
                    <div className="ml-3">
                      <p className="text-lg">
                        {bidder.bidder.substring(0, 8) +
                          "..." +
                          bidder.bidder.substring(bidder.bidder.length - 6)}
                      </p>
                      <p className="text-xl text-gray-500">
                        {calculateTimeDifference(bidder.timestamp)}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold">
                    {bidder.bidAmount} ETH
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <OfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tokenId={tokenId}
        floorPrice={bidPrice}
        highestBid={
          bidders.length > 0 ? bidders[bidders.length - 1].bidAmount : 0
        }
        setBidders={setBidders}
      />
    </div>
  );
}

export default ListedNFTPage;
