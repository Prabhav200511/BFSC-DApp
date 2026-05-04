const fs = require("fs");
const path = require("path");
const Web3 = require("web3");

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:7545";
const rootDir = path.resolve(__dirname, "..");
const artifactPath = path.join(rootDir, "src", "abis", "PDS.json");

function loadContract(web3) {
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return web3.eth.net.getId().then((networkId) => {
    const network = artifact.networks && artifact.networks[String(networkId)];
    if (!network || !network.address) {
      throw new Error(`PDS is not deployed for network ${networkId}. Run npm run contracts:migrate first.`);
    }
    return new web3.eth.Contract(artifact.abi, network.address);
  });
}

async function send(label, tx, from, gas = 500000) {
  console.log(label);
  return tx.send({ from, gas });
}

async function ensureShop(pds, id, name, account, location, sender) {
  const existing = await pds.methods.shops(id).call();
  if (existing.exists) {
    console.log(`Shop ${id} already exists: ${existing.name}`);
    return;
  }
  await send(
    `Registering shop ${id}: ${name}`,
    pds.methods.addShops(id, name, account, location),
    sender,
    700000
  );
}

async function main() {
  const web3 = new Web3(new Web3.providers.HttpProvider(RPC_URL));
  const accounts = await web3.eth.getAccounts();

  if (accounts.length < 7) {
    throw new Error("Demo setup needs at least 7 Ganache accounts.");
  }

  const pds = await loadContract(web3);
  const creator = accounts[0];
  const stateAdmin = accounts[1];
  const districtAdmin = accounts[2];
  const shopOwner = accounts[3];
  const consumer = accounts[4];
  const deliveryAgent = accounts[5];
  const backupShopOwner = accounts[6];

  console.log("\n===== BFSC2 SINGLE-LAPTOP DEMO SETUP =====");
  console.log(`Contract:        ${pds.options.address}`);
  console.log(`Creator:         ${creator}`);
  console.log(`State Admin:     ${stateAdmin}`);
  console.log(`District Admin:  ${districtAdmin}`);
  console.log(`Shop Owner:      ${shopOwner}`);
  console.log(`Consumer:        ${consumer}`);
  console.log(`Delivery Agent:  ${deliveryAgent}`);
  console.log("==========================================\n");

  await send("Granting State Admin role", pds.methods.addStateAdmins(stateAdmin), creator);
  await send("Granting District Admin role", pds.methods.addDistrictAdmins(districtAdmin), stateAdmin);
  await send("Registering Delivery Agent", pds.methods.addDeliveryAgent(deliveryAgent), stateAdmin);

  await ensureShop(pds, 100, "Central Fair Price Shop", shopOwner, "Main Market", districtAdmin);
  await ensureShop(pds, 101, "North Fair Price Shop", backupShopOwner, "North Ward", districtAdmin);

  await send("Registering Consumer", pds.methods.addConsumer(consumer), districtAdmin);

  await send("Adding item 1 Rice", pds.methods.addItems(1, "Rice", 30), stateAdmin);
  await send("Adding item 2 Wheat", pds.methods.addItems(2, "Wheat", 25), stateAdmin);
  await send("Adding item 3 Sugar", pds.methods.addItems(3, "Sugar", 40), stateAdmin);
  await send("Adding item 4 Cooking Oil", pds.methods.addItems(4, "Cooking Oil", 120), stateAdmin);

  await send("Tokenizing bag 1001", pds.methods.addBags(1001, 1, 1), stateAdmin);
  await send("Tokenizing bag 1002", pds.methods.addBags(1002, 2, 1), stateAdmin);
  await send("Tokenizing bag 1003", pds.methods.addBags(1003, 3, 1), stateAdmin);
  await send("Tokenizing bag 1004", pds.methods.addBags(1004, 4, 1), stateAdmin);
  await send("Tokenizing bag 1005", pds.methods.addBags(1005, 1, 1), stateAdmin);

  await send("State to District transfer", pds.methods.transferedBags(0, 20, [1001, 1002, 1003, 1004, 1005]), stateAdmin, 800000);
  await send("District to Shop 100 transfer", pds.methods.transferedBags(20, 100, [1001, 1002, 1003]), districtAdmin, 800000);
  await send("District to Shop 101 transfer", pds.methods.transferedBags(20, 101, [1004, 1005]), districtAdmin, 800000);

  await send("Shop 100 receipt", pds.methods.receivedBags(20, 100, [1001, 1002, 1003]), shopOwner, 800000);
  await send("Shop 101 receipt", pds.methods.receivedBags(20, 101, [1004, 1005]), backupShopOwner, 800000);

  await send("Shop 100 inventory attestation", pds.methods.updateShopInventory(100, 1, 80), shopOwner);
  await send("Shop 100 low-stock attestation", pds.methods.updateShopInventory(100, 2, 6), shopOwner);

  await send("Shop owner fulfills consumer order", pds.methods.orderMade(consumer, 100, [1, 2], [5, 3]), shopOwner, 900000);
  await send("Consumer signs ration request", pds.methods.placeConsumerOrder(100, [1, 3], [4, 1]), consumer, 900000);

  await send("Assigning delivery pickup 1", pds.methods.assignRationPickup(deliveryAgent, 100, [1001, 1002]), stateAdmin, 900000);

  console.log("\n===== DEMO VALUES =====");
  console.log("MetaMask RPC:       http://127.0.0.1:7545");
  console.log("Shop ID:            100");
  console.log("Pickup ID:          1");
  console.log("Item IDs:           1=Rice, 2=Wheat, 3=Sugar, 4=Cooking Oil");
  console.log("Bag IDs:            1001,1002,1003,1004,1005");
  console.log("Import Ganache accounts[1] to [5] into MetaMask and switch roles during the demo.");
  console.log("=======================\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
