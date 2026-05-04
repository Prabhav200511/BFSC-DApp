const PDS = artifacts.require("PDS");

module.exports = async function(callback) {
  try {
    const pds = await PDS.deployed();
    const accounts = await web3.eth.getAccounts();
    const creator      = accounts[0];
    const stateAdmin   = accounts[1];
    const districtAdmin = accounts[2];

    // Your MetaMask addresses
    const metamaskShopOwner = "0xe05e56f7e40CBfe2360BA938C66985640Ee3EFd5";
    const metamaskConsumer  = "0xCfbB46588130F9987b8b467858C82525bCF7CB17";

    console.log("Granting State Admin to MetaMask Shop Owner...");
    await pds.addStateAdmins(metamaskShopOwner, {from: creator});

    console.log("Granting District Admin to MetaMask Shop Owner...");
    await pds.addDistrictAdmins(metamaskShopOwner, {from: stateAdmin});

    console.log("Granting State Admin to MetaMask Consumer...");
    await pds.addStateAdmins(metamaskConsumer, {from: creator});

    console.log("Granting District Admin to MetaMask Consumer...");
    await pds.addDistrictAdmins(metamaskConsumer, {from: stateAdmin});

    console.log("\n========================================");
    console.log("Roles granted! Both your MetaMask accounts now have:");
    console.log("  - State Admin (can transfer bags, add items, add bags)");
    console.log("  - District Admin (can add shops, add consumers, receive bags)");
    console.log("  - Consumer (can receive orders)");
    console.log("  - 0xe05e... is also the Shop 102 owner (can make orders)");
    console.log("========================================\n");
    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
