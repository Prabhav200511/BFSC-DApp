const PDS = artifacts.require("PDS");

module.exports = async function(callback) {
  try {
    const pds = await PDS.deployed();
    const accounts = await web3.eth.getAccounts();
    const creator = accounts[0]; 
    const stateAdmin = accounts[1];
    const districtAdmin = accounts[2];
    const ganacheShopAccount = accounts[3]; // Used for signing seed txns
    const deliveryAgent = accounts[5];

    // User's real MetaMask addresses
    const metamaskShopOwner = "0xe05e56f7e40CBfe2360BA938C66985640Ee3EFd5";
    const metamaskConsumer  = "0xCfbB46588130F9987b8b467858C82525bCF7CB17";

    console.log("Adding State Admin...");
    await pds.addStateAdmins(stateAdmin, {from: creator});
    
    console.log("Adding District Admin...");
    await pds.addDistrictAdmins(districtAdmin, {from: stateAdmin});

    console.log("Adding Delivery Agent...");
    await pds.addDeliveryAgent(deliveryAgent, {from: stateAdmin});

    console.log("Adding Shops...");
    await pds.addShops(100, "Main District Ration Shop", ganacheShopAccount, "Central Plaza", {from: districtAdmin});
    await pds.addShops(101, "North Branch Shop", ganacheShopAccount, "North Avenue", {from: districtAdmin});
    // Shop 102 is owned by your MetaMask address — use this Shop ID in the UI!
    await pds.addShops(102, "My MetaMask Shop", metamaskShopOwner, "MetaMask Street", {from: districtAdmin});

    console.log("Adding Consumers...");
    await pds.addConsumer(accounts[4], {from: districtAdmin});
    await pds.addConsumer(creator, {from: districtAdmin});
    await pds.addConsumer(metamaskConsumer, {from: districtAdmin});
    await pds.addConsumer(metamaskShopOwner, {from: districtAdmin});

    console.log("Adding Items...");
    await pds.addItems(1, "Rice", 30, {from: stateAdmin});
    await pds.addItems(2, "Wheat", 25, {from: stateAdmin});
    await pds.addItems(3, "Sugar", 40, {from: stateAdmin});
    await pds.addItems(4, "Cooking Oil", 120, {from: stateAdmin});
    await pds.addItems(5, "Lentils (Dal)", 80, {from: stateAdmin});

    console.log("Adding Bags...");
    await pds.addBags(1001, "Rice", {from: stateAdmin});
    await pds.addBags(1002, "Wheat", {from: stateAdmin});
    await pds.addBags(1003, "Sugar", {from: stateAdmin});
    await pds.addBags(1004, "Cooking Oil", {from: stateAdmin});
    await pds.addBags(1005, "Lentils", {from: stateAdmin});
    await pds.addBags(1006, "Rice", {from: stateAdmin});
    await pds.addBags(1007, "Wheat", {from: stateAdmin});

    console.log("Transferring Bags...");
    await pds.transferedBags(1, 100, [1001, 1002, 1003], {from: stateAdmin});
    await pds.transferedBags(1, 101, [1004, 1005], {from: stateAdmin});
    await pds.transferedBags(1, 102, [1006, 1007], {from: stateAdmin});

    console.log("Receiving Bags...");
    await pds.receivedBags(1, 100, [1001, 1002, 1003], {from: districtAdmin});
    await pds.receivedBags(1, 101, [1004, 1005], {from: districtAdmin});
    await pds.receivedBags(1, 102, [1006, 1007], {from: districtAdmin});

    console.log("Making Seed Orders (from Shop 100 & 101)...");
    await pds.orderMade(creator, 100, [1, 2], [5, 10], {from: ganacheShopAccount});
    await pds.orderMade(accounts[4], 101, [4], [2], {from: ganacheShopAccount});
    // Anomalous Order: Suspiciously high quantity!
    await pds.orderMade(creator, 100, [1], [150], {from: ganacheShopAccount});
    await pds.orderMade(creator, 101, [3, 5], [2, 1], {from: ganacheShopAccount});

    console.log("\n========================================");
    console.log("Seed data populated successfully!");
    console.log("\n>>> YOUR METAMASK SETUP <<<");
    console.log("Shop 102 Owner (connect MetaMask as): " + metamaskShopOwner);
    console.log("Consumer (enter in order form):       " + metamaskConsumer);
    console.log("Shop ID to use in the UI:             102");
    console.log("========================================\n");
    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
