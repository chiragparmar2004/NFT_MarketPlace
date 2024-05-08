import React, { useState } from "react";
import { ProgressBar } from "react-loader-spinner";
import { contractABI, contractAddress } from "../utils/constant";
import { toast } from "react-toastify";
import { ethers } from "ethers";

const CreateNFT = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [NFTURI, setNFTURI] = useState("");
  const [loading, setLoading] = useState(false); // State for loader
  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    // Show image preview
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadNFTToIPFS = async () => {
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", image);

      const metadata = JSON.stringify({
        name: title,
        description: description,
      });
      formDataObj.append("pinataMetadata", metadata);

      const options = JSON.stringify({
        cidVersion: 0,
      });

      formDataObj.append("pinataOptions", options);

      const imageUploadRes = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: formDataObj,
        }
      );

      const imageUploadResData = await imageUploadRes.json();

      const nftMetadata = {
        title: title,
        description: description,
        image: `https://gateway.pinata.cloud/ipfs/${imageUploadResData.IpfsHash}`,
      };

      const jsonData = JSON.stringify(nftMetadata);

      const metadataOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
        body: jsonData,
      };

      const metadataUploadRes = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadataOptions
      );

      const metadataUploadResData = await metadataUploadRes.json();

      const metadataCID = metadataUploadResData.IpfsHash;
      setNFTURI(metadataCID);

      setTitle("");
      setDescription("");
      setImage("");

      return metadataCID;
    } catch (error) {
      console.error("Error uploading NFT to IPFS:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loader
    try {
      const metadataURL = await uploadNFTToIPFS();
      if (metadataURL === -1) return;

      // Here you can proceed with the contract interaction if needed
      let provider = new ethers.providers.Web3Provider(window.ethereum);

      // Load the contract ABI and address
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        provider.getSigner() // Use signer from the provider
      );

      console.log(metadataURL, "Testing");

      let transaction = await contract.createToken(metadataURL);
      await transaction.wait();
      console.log("transaction", transaction);

      toast.success("Successfully Added your NFT!");

      setTimeout(() => {
        window.location.replace("/MyNFT");
      }, 2000);
    } catch (error) {
      console.log("Upload error", error);
      toast.error("Error listing your NFT. Please try again.");
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <>
      {loading ? (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center">
          <ProgressBar
            visible={true}
            height="180"
            width="180"
            color="#4fa94d"
            ariaLabel="progress-bar-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      ) : (
        <div className="w-[50%] mx-auto mt-8 rounded-lg overflow-hidden">
          <h1 className="text-5xl text-center">Add NFT To Marketplace</h1>
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                rows="4"
                required
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image
              </label>
              <input
                type="file"
                id="image"
                onChange={handleImageChange}
                className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500"
                accept="image/*"
                required
              />
              {/* Image preview */}
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mt-2 max-w-full h-auto"
                />
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:bg-indigo-700"
              >
                Add NFT
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default CreateNFT;
