const fs = require("fs");
const path = require("path");
const Web3 = require("web3");

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";
const rootDir = path.resolve(__dirname, "..");
const artifactPath = path.join(rootDir, "src", "abis", "PDS.json");

async function main() {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
  const accounts = await web3.eth.getAccounts();

  if (!accounts.length) {
    throw new Error(`No unlocked accounts found at ${RPC_URL}`);
  }

  const networkId = await web3.eth.net.getId();
  const deployer = accounts[0];
  let transactionHash = "";

  console.log(`Deploying PDS to ${RPC_URL}`);
  console.log(`Network ID: ${networkId}`);
  console.log(`Deployer:   ${deployer}`);

  const contract = new web3.eth.Contract(artifact.abi);
  const instance = await contract
    .deploy({
      data: artifact.bytecode,
      arguments: [50]
    })
    .send({
      from: deployer,
      gas: 6500000
    })
    .on("transactionHash", (hash) => {
      transactionHash = hash;
      console.log(`Deploy tx:  ${hash}`);
    });

  artifact.networks = artifact.networks || {};
  artifact.networks[String(networkId)] = {
    events: {},
    links: {},
    address: instance.options.address,
    transactionHash
  };
  artifact.updatedAt = new Date().toISOString();

  fs.writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);

  console.log(`PDS deployed at ${instance.options.address}`);
  console.log(`Updated ${artifactPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
