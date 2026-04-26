const PDS = artifacts.require("PDS");

module.exports = async function(callback) {
  try {
    const pds = await PDS.deployed();
    const accounts = await web3.eth.getAccounts();
    const creator = accounts[0]; 
    const stateAdmin = accounts[1];
    const districtAdmin = accounts[2];
    
    const userAddress = "0xe05e56f7e40CBfe2360BA938C66985640Ee3EFd5";
    
    console.log("Granting roles to user:", userAddress);

    await pds.addStateAdmins(userAddress, {from: creator});
    console.log("Granted State Admin role");

    await pds.addDistrictAdmins(userAddress, {from: stateAdmin});
    console.log("Granted District Admin role");

    await pds.addConsumer(userAddress, {from: districtAdmin});
    console.log("Granted Consumer role");

    // Adding a specific shop assigned to the user so they can test shop-related functions
    await pds.addShops(999, "My Personal Shop", userAddress, "Test Location", {from: districtAdmin});
    console.log("Created Shop ID 999 and assigned it to the user.");

    console.log("Successfully granted roles!");
    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
