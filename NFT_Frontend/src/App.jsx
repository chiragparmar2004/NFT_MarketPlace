import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ExploreMarketPlace from "./pages/ExploreMarketPlace";
import Home from "./pages/Home";
import CreateNFT from "./pages/CreateNFT";
import MyNFT from "./pages/MyNFT";
import NFTPage from "./components/NFTPage";
import UnlistedNFTPage from "./components/UnlistedNFTPage";
import ListedNFTPage from "./components/ListedNFTPage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <div className="h-[100vh] w-[100vw] bg-gradient-to-r from-teal-100 to-yellow-100 overflow-x-auto">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ExploreMarketPlace" element={<ExploreMarketPlace />} />
        <Route path="/CreateNFT" element={<CreateNFT />} />
        <Route path="/MyNFT" element={<MyNFT />} />
        <Route path="/nftPage/:tokenId" element={<NFTPage />} />
        <Route path="/unlistedNFTPage/:tokenId" element={<UnlistedNFTPage />} />
        <Route path="/listedNFTPage/:tokenId" element={<ListedNFTPage />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
