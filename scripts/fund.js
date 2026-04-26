module.exports = async function(callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];
    const receiver = "0xe05e56f7e40CBfe2360BA938C66985640Ee3EFd5";
    
    console.log(`Sending 10 ETH from ${sender} to ${receiver}...`);
    
    await web3.eth.sendTransaction({
      from: sender,
      to: receiver,
      value: web3.utils.toWei("10", "ether")
    });
    
    console.log("Successfully sent 10 ETH!");
    callback();
  } catch(e) {
    console.error(e);
    callback(e);
  }
}
