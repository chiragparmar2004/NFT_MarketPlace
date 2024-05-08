export const GetIpfsUrlFromPinata = (pinataUrl) => {
  if (!pinataUrl) {
    console.error("Pinata URL is undefined");
    return ""; // or handle the error accordingly
  }

  var IPFSUrl = pinataUrl.split("/");
  const lastIndex = IPFSUrl.length;
  IPFSUrl =
    "https://emerald-certain-cobra-933.mypinata.cloud/ipfs/" +
    IPFSUrl[lastIndex - 1];

  return IPFSUrl;
};
