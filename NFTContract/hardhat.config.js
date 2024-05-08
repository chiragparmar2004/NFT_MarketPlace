// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.24",
// };
require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      accounts: {
        mnemonic:
          "broccoli material hip purity dream speak trouble deposit lumber move eager member",
      },
      chainId: 1337,
      mining: {
        auto: true,
        interval: 2000,
      },
    },
  },
};
