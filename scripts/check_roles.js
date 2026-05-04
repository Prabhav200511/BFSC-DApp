const PDS = artifacts.require("PDS");

module.exports = async function(callback) {
  try {
    const pds = await PDS.deployed();
    const accounts = await web3.eth.getAccounts();

    console.log("\n===== ACCOUNT ROLES =====");
    for (let i = 0; i < Math.min(accounts.length, 8); i++) {
      const isStateAdmin  = await pds.stateAdmin(accounts[i]);
      const isDistAdmin   = await pds.districtAdmin(accounts[i]);
      const isConsumer    = await pds.consumer(accounts[i]);
      const isDelivery    = await pds.deliveryAgents(accounts[i]);
      const isCreator     = (accounts[i].toLowerCase() === (await pds.creator()).toLowerCase());

      const roles = [];
      if (isCreator)   roles.push("CREATOR");
      if (isStateAdmin) roles.push("STATE_ADMIN");
      if (isDistAdmin)  roles.push("DISTRICT_ADMIN");
      if (isConsumer)   roles.push("CONSUMER");
      if (isDelivery)   roles.push("DELIVERY_AGENT");
      if (roles.length === 0) roles.push("(no role)");

      console.log(`accounts[${i}] ${accounts[i]}  =>  ${roles.join(", ")}`);
    }

    // Check shop 100 and 101
    console.log("\n===== SHOPS =====");
    for (const shopId of [100, 101]) {
      const shop = await pds.shops(shopId);
      if (shop.exists) {
        console.log(`Shop ${shopId}: "${shop.name}"  owner: ${shop.account}`);
      } else {
        console.log(`Shop ${shopId}: NOT FOUND`);
      }
    }

    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
