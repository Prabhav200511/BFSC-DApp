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
  const networkId = await web3.eth.net.getId();
  const network = artifact.networks && artifact.networks[String(networkId)];

  if (!network || !network.address) {
    throw new Error(`PDS is not deployed for network ${networkId}.`);
  }

  const pds = new web3.eth.Contract(artifact.abi, network.address);
  const creator = await pds.methods.creator().call();

  console.log("\n===== ACCOUNT ROLES =====");
  for (let i = 0; i < Math.min(accounts.length, 8); i++) {
    const account = accounts[i];
    const isStateAdmin = await pds.methods.stateAdmin(account).call();
    const isDistrictAdmin = await pds.methods.districtAdmin(account).call();
    const isConsumer = await pds.methods.consumer(account).call();
    const isDeliveryAgent = await pds.methods.deliveryAgents(account).call();
    const isCreator = account.toLowerCase() === creator.toLowerCase();

    const roles = [];
    if (isCreator) roles.push("CREATOR");
    if (isStateAdmin) roles.push("STATE_ADMIN");
    if (isDistrictAdmin) roles.push("DISTRICT_ADMIN");
    if (isConsumer) roles.push("CONSUMER");
    if (isDeliveryAgent) roles.push("DELIVERY_AGENT");
    if (!roles.length) roles.push("(no role)");

    console.log(`accounts[${i}] ${account} => ${roles.join(", ")}`);
  }

  console.log("\n===== SHOPS =====");
  for (const shopId of [100, 101, 102, 103]) {
    const shop = await pds.methods.shops(shopId).call();
    if (shop.exists) {
      console.log(`Shop ${shopId}: "${shop.name}" owner: ${shop.account}`);
    } else {
      console.log(`Shop ${shopId}: NOT FOUND`);
    }
  }

  console.log("\n===== COUNTERS =====");
  console.log(`Transfers:          ${await pds.methods.transfersCount().call()}`);
  console.log(`Receipts:           ${await pds.methods.receivedCount().call()}`);
  console.log(`Fulfilled orders:   ${await pds.methods.ordersCount().call()}`);
  console.log(`Consumer requests:  ${await pds.methods.consumerRequestsCount().call()}`);
  console.log(`Pickups:            ${await pds.methods.nextPickupId().call()}`);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
