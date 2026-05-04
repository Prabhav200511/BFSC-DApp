// WEB3
export function web3Loaded(connection) {
  return {
    type: 'WEB3_LOADED',
    connection
  }
}

export function web3AccountLoaded(account) {
  return {
    type: 'WEB3_ACCOUNT_LOADED',
    account
  }
}

export function web3NetworkLoaded(networkId) {
  return {
    type: 'WEB3_NETWORK_LOADED',
    networkId
  }
}

// PDS
export function pdsLoaded(contract) {
  return {
    type: 'PDS_LOADED',
    contract
  }
}
