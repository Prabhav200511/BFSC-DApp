const PDS = artifacts.require("PDS");

module.exports = async function(callback) {
  try {
    const pds = await PDS.deployed();
    const accounts = await web3.eth.getAccounts();
    const creator = accounts[0]; // deployer
    const stateAdmin = accounts[1];
    const districtAdmin = accounts[2];
    const shopAccount = accounts[3];
    const consumerAccount = accounts[4]; // Or use the one I gave the user

    console.log("Adding State Admin...");
    await pds.addStateAdmins(stateAdmin, {from: creator});
    
    console.log("Adding District Admin...");
    await pds.addDistrictAdmins(districtAdmin, {from: stateAdmin});

    console.log("Adding Shop...");
    // App.js hardcodes shop ID 100.
    await pds.addShops(100, "Main District Ration Shop", shopAccount, "Central Plaza", {from: districtAdmin});

    console.log("Adding Consumer...");
    await pds.addConsumer(consumerAccount, {from: districtAdmin});
    // Also add the account we imported for the user just in case
    await pds.addConsumer(creator, {from: districtAdmin});

    console.log("Adding Items...");
    await pds.addItems(1, "Rice", 30, {from: stateAdmin});
    await pds.addItems(2, "Wheat", 25, {from: stateAdmin});

    console.log("Adding Bags...");
    await pds.addBags(1001, "Rice", {from: stateAdmin});
    await pds.addBags(1002, "Wheat", {from: stateAdmin});

    console.log("Transferring Bags...");
    await pds.transferedBags(1, 100, [1001, 1002], {from: stateAdmin});

    console.log("Receiving Bags...");
    // Must be from shopAccount because require(shops[_toId].exists) or districtAdmin. 
    // Wait, the check is `districtAdmin[msg.sender] || shops[_toId].exists` which means it doesn't strictly check if `msg.sender` is the shop owner, just that the shop exists.
    await pds.receivedBags(1, 100, [1001, 1002], {from: districtAdmin});

    console.log("Making Order...");
    // require(shops[_shopId].exists && shops[_shopId].account==msg.sender && consumer[_customer]);
    // So this MUST be sent from shopAccount!
    await pds.orderMade(creator, 100, [1, 2], [5, 10], {from: shopAccount});

    console.log("Seed data populated successfully!");
    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
