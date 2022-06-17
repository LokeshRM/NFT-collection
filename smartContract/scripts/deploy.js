const hre = require("hardhat");

async function main() {
  const Nft = await hre.ethers.getContractFactory("NFT_Collection");
  const nft = await Nft.deploy(
    "0x43f7e85d592A503A3cb2290cCe333870F5c17365",
    "https://crypto-rain.netlify.app/api/"
  );

  await nft.deployed();

  console.log("NFt deployed to:", nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
