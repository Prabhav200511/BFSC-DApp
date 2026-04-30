const PDS = artifacts.require("PDS");

module.exports = async function(callback) {
  try {
    const pds = await PDS.deployed();
    const accounts = await web3.eth.getAccounts();
    const creator = accounts[0]; 
    const stateAdmin = accounts[1];
    const districtAdmin = accounts[2];
    const shopAccount = accounts[3];
    const consumerAccount = accounts[4];
    const deliveryAgent = accounts[5];

    console.log("Adding State Admin...");
    await pds.addStateAdmins(stateAdmin, {from: creator});
    
    console.log("Adding District Admin...");
    await pds.addDistrictAdmins(districtAdmin, {from: stateAdmin});

    console.log("Adding Delivery Agent...");
    await pds.addDeliveryAgent(deliveryAgent, {from: stateAdmin});

    console.log("Adding Shops...");
    await pds.addShops(100, "Main District Ration Shop", shopAccount, "Central Plaza", {from: districtAdmin});
    await pds.addShops(101, "North Branch Shop", shopAccount, "North Avenue", {from: districtAdmin}); // Using same account for testing

    console.log("Adding Consumers...");
    await pds.addConsumer(consumerAccount, {from: districtAdmin});
    await pds.addConsumer(creator, {from: districtAdmin});

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

    console.log("Transferring Bags...");
    await pds.transferedBags(1, 100, [1001, 1002, 1003], {from: stateAdmin});
    await pds.transferedBags(1, 101, [1004, 1005], {from: stateAdmin});

    console.log("Receiving Bags...");
    await pds.receivedBags(1, 100, [1001, 1002, 1003], {from: districtAdmin});
    await pds.receivedBags(1, 101, [1004, 1005], {from: districtAdmin});

    console.log("Making Orders...");
    
    // 1. Normal Order
    await pds.orderMade(creator, 100, [1, 2], [5, 10], {from: shopAccount});
    
    // 2. Normal Order
    await pds.orderMade(consumerAccount, 101, [4], [2], {from: shopAccount});
    
    // 3. Anomalous Order: Suspiciously high quantity! (>100)
    await pds.orderMade(creator, 100, [1], [150], {from: shopAccount});

    // 4. Anomalous Order: Too many unique items! (>10)
    await pds.orderMade(consumerAccount, 100, [1,2,3,4,5,6,7,8,9,10,11], [1,1,1,1,1,1,1,1,1,1,1], {from: shopAccount});

    // 5. Normal Order
    await pds.orderMade(creator, 101, [3, 5], [2, 1], {from: shopAccount});

    console.log("Seed data populated successfully!");
    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
