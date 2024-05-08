import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { contractABI, contractAddress } from "../utils/constant";
import axios from "axios";
import { GetIpfsUrlFromPinata } from "../utils/GetIPFSPinataURL";
import { useParams } from "react-router-dom";

export default function NFTPage() {
  const [data, updateData] = useState({});
  const [dataFetched, updateDataFetched] = useState(false);
  const [message, updateMessage] = useState("");
  const [currAddress, updateCurrAddress] = useState("0x");
  const params = useParams();

  useEffect(() => {
    async function fetchData() {
      const tokenId = params.tokenId;
      console.log(tokenId);
      if (!dataFetched) {
        await getNFTData(tokenId);
      }
    }

    fetchData();
  }, [dataFetched, params]);

  async function getNFTData(tokenId) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const addr = await signer.getAddress();

      let contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log("hello early");
      const NFT_Token = await contract.getListedTokenDetails(tokenId);
      console.log(NFT_Token, "Token_NFT");
      console.log("hello");
      var tokenURI = await contract.tokenURI(tokenId);
      // console.log(tokenId);
      console.log(tokenURI, "TokenURI");

      tokenURI = GetIpfsUrlFromPinata(tokenURI);
      let meta = await axios.get(tokenURI);
      console.log(meta.data);

      let item = {
        price: meta.data.price,
        tokenId: tokenId,
        // seller: seller,
        // owner: owner,
        image: meta.data.image,
        name: meta.data.title,
        description: meta.data.description,
      };

      updateData(item);
      updateDataFetched(true);
      updateCurrAddress(addr);
    } catch (error) {
      console.error("Error fetching NFT data:", error);
    }
  }

  async function buyNFT(tokenId) {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(contractAddress, contractABI, signer);
      const salePrice = ethers.utils.parseUnits(data.price, "ether");
      updateMessage("Buying the NFT... Please Wait (Upto 5 mins)");

      let transaction = await contract.executeSale(tokenId, {
        value: salePrice,
      });
      await transaction.wait();

      alert("You successfully bought the NFT!");
      updateMessage("");
    } catch (error) {
      alert("Error buying NFT: " + error.message);
    }
  }

  if (typeof data.image === "string") {
    data.image = GetIpfsUrlFromPinata(data.image);
  }

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="flex ml-20 mt-20">
        <img src={data.image} alt="" className="w-2/5" />
        <div className="text-xl ml-20 space-y-8  shadow-2xl rounded-lg border-2 p-5">
          <div>Name: {data.name}</div>
          <div>Description: {data.description}</div>
          <div>
            Price: <span className="">{data.price + " ETH"}</span>
          </div>
          <div>
            Owner: <span className="text-sm">{data.owner}</span>
          </div>
          <div>
            Seller: <span className="text-sm">{data.seller}</span>
          </div>
          <div>
            {currAddress !== data.owner && currAddress !== data.seller ? (
              <button
                className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                onClick={() => buyNFT(data.tokenId)}
              >
                Buy this NFT
              </button>
            ) : (
              <div className="text-emerald-700">
                You are the owner of this NFT
              </div>
            )}

            <div className="text-green text-center mt-3">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
