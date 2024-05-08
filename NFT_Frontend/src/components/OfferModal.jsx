import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";

import { toast } from "react-toastify";

function OfferModal({
  isOpen,
  onClose,
  tokenId,
  floorPrice,
  highestBid,
  setBidders,
}) {
  const [offerAmount, setOfferAmount] = useState("");
  const [userBalance, setUserBalance] = useState("");

  useEffect(() => {
    // Function to fetch user's balance
    const fetchUserBalance = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const balance = await provider.getBalance(accounts[0]);
          setUserBalance(ethers.utils.formatEther(balance));
        }
      }
    };

    fetchUserBalance();
  }, []);

  const handleSubmitOffer = async () => {
    try {
      // Ensure window.ethereum is available
      if (!window.ethereum || !window.ethereum.isMetaMask) {
        throw new Error("MetaMask is not installed or not accessible.");
      }
      // Request user permission to connect to MetaMask
      await window.ethereum.request({ method: "eth_requestAccounts" });

      // Initialize the provider with MetaMask
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Get the signer object for transaction signing
      const signer = provider.getSigner();

      // Create the contract instance
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Convert offer amount to Wei
      const offerAmountInWei = ethers.utils.parseEther(offerAmount);

      // Validate bid amount
      let highestBid = await contract.getHighestBid(tokenId);

      // Validate bid amount is higher than current highest bid
      if (offerAmountInWei.lte(highestBid)) {
        throw new Error("Bid must be higher than current highest bid.");
      }

      // Get auction details
      const [, , startPrice] = await contract.getAuctionDetails(tokenId);
      // Check if offer is greater than or equal to start price
      if (offerAmountInWei.lt(startPrice)) {
        throw new Error(
          "Offer amount must be greater than or equal to the start price."
        );
      }

      // Check if bid amount exceeds user's balance
      const userBalanceInWei = ethers.utils.parseEther(userBalance);
      if (offerAmountInWei.gt(userBalanceInWei)) {
        throw new Error("Bid amount exceeds your balance.");
      }

      // Send transaction with the exact bid amount
      const options = { value: offerAmountInWei };
      const transactionResponse = await contract.placeBid(tokenId, options);

      // Wait for transaction to be mined
      await transactionResponse.wait();

      // Update bid history with the new bid
      const [newBiddersList, newBids] = await contract.getAllBids(tokenId);
      const newBiddersData = newBiddersList.map((bidder, index) => ({
        bidder,
        bidAmount: ethers.utils.formatUnits(newBids[index].toString(), "ether"),
      }));
      setBidders(newBiddersData);

      // Update highest bid if applicable
      if (newBiddersData.length > 0) {
        const newHighestBid =
          newBiddersData[newBiddersData.length - 1].bidAmount;
        highestBid = newHighestBid;
      }

      toast.success("Successfully placed your bid!");
      onClose(); // Close modal after placing bid

      toast.success("Successfully placed your bid!");
      onClose(); // Close modal after placing bid
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast.error(error.message); // Show error message in toast
    }
  };

  const formattedFloorPrice = floorPrice
    ? ethers.utils.formatUnits(floorPrice, "ether")
    : "";
  return (
    <div
      className={`fixed z-10 inset-0 overflow-y-auto flex items-center justify-center ${
        isOpen ? "" : "hidden"
      }`}
    >
      <div
        className="fixed inset-0 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>

      <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-3xl w-full">
        <div className="bg-white px-8 py-6">
          <h3 className="text-2xl leading-6 font-medium text-gray-900 mb-4">
            Make Offer
          </h3>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Your Balance: {userBalance} ETH
            </p>
            <p className="text-sm text-gray-500">
              Floor Price: {formattedFloorPrice} ETH
            </p>
            <p className="text-sm text-gray-500">
              Highest Bid: {highestBid.toString()} ETH
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="offerAmount"
              className="block text-sm font-medium text-gray-700"
            >
              Enter your offer amount in ETH:
            </label>
            <input
              type="text"
              name="offerAmount"
              id="offerAmount"
              value={offerAmount}
              onChange={(e) => setOfferAmount(e.target.value)}
              className="block w-full rounded-md py-1.5 px-2 ring-1 ring-inset ring-gray-400 focus:text-gray-800"
              placeholder="Enter amount"
            />
          </div>

          <div className="flex justify-between gap-40">
            <button
              type="button"
              className="inline-flex justify-center w-1/2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSubmitOffer}
            >
              Submit Offer
            </button>
            <button
              type="button"
              className="inline-flex justify-center w-1/2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-transparent rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfferModal;
