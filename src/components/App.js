import React, { Component } from 'react'
import moment from 'moment'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { connect } from 'react-redux'
import { loadWeb3, loadNetwork, loadAccount, loadPDS } from '../store/interactions'
import { pdsLoadedSelector } from '../store/selectors'
import NavbarComp from './NavbarComp';
import LiveEventStream from './LiveEventStream';
import Home from './Home';
import Order from './Order';
import Details from './Details';
import Transactions from './Transactions';
import Usertrans from './Usertrans';
import Results from './Results';
import Districtres from './Districtres';
import Transfer from './Transfer';
import AddReceivedBags from './AddReceivedBags';
import AnomalyDashboard from './AnomalyDashboard';
import BlockchainConsole from './BlockchainConsole';

class App extends Component {
  constructor(props){
    super(props);
    this.state = { transfered:[], received:[], orders:[], consumerRequests:[] };
  }

  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', () => this.loadBlockchainData(this.props.dispatch))
      window.ethereum.on('chainChanged', () => this.loadBlockchainData(this.props.dispatch))
    }
    // Poll for new events every 5 seconds
    this._pollInterval = setInterval(() => {
      if(this._pds) this.fetchEvents(this._pds)
    }, 5000)
  }

  componentWillUnmount() {
    if(this._pollInterval) clearInterval(this._pollInterval)
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch)
    if(!web3) return
    const networkId = await loadNetwork(web3, dispatch)
    await loadAccount(web3, dispatch)
    const pds = await loadPDS(web3, networkId, dispatch)
    if(!pds) { window.alert('PDS smart contract not detected.'); return }
    this._pds = pds
    this.fetchEvents(pds)
  }

  async fetchEvents(pds) {
    try{
      const transferHistory = await pds.getPastEvents('Transfered', { fromBlock: 0, toBlock: 'latest' })
      let transfers = transferHistory.map(e => { const d=e.returnValues; return { fromId:d.fromId, toId:d.toId, Bags:d.bagIds, time:moment.unix(d.timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A') }})
      const receivedHistory = await pds.getPastEvents('Received', { fromBlock: 0, toBlock: 'latest' })
      let received = receivedHistory.map(e => { const d=e.returnValues; return { fromId:d.fromId, toId:d.toId, Bags:d.bagIds, time:moment.unix(d.timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A') }})
      const ordersHistory = await pds.getPastEvents('Order', { fromBlock: 0, toBlock: 'latest' })
      let orders = ordersHistory.map(e => { const d=e.returnValues; return { customerMetamaskAccount:d.customerAddress, shopId:d.shopId, itemIds:d.itemIds, eachItemQuantities:d.quantities, time:moment.unix(d.timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A') }})
      const crHistory = await pds.getPastEvents('ConsumerOrderRequested', { fromBlock: 0, toBlock: 'latest' })
      let consumerRequests = crHistory.map(e => { const d=e.returnValues; return { consumerMetamaskAccount:d.consumerAddress, shopId:d.shopId, itemIds:d.itemIds, eachItemQuantities:d.quantities, estimatedCost:d.estimatedCost, time:moment.unix(d.timestamp).format('dddd, MMMM Do, YYYY h:mm:ss A') }})
      this.setState({ transfered:transfers, received, orders, consumerRequests })
    }catch(e){ console.error(e) }
  }

  render() {
    return (
      <Router>
        <div className='app-shell'>
          <NavbarComp />
          <main className="app-main">
            <Switch>
              <Route path="/transfer"><Transfer /></Route>
              <Route path="/AddReceivedBags"><AddReceivedBags /></Route>
              <Route path="/districtres"><Districtres transfered={this.state.transfered} received={this.state.received} orders={this.state.orders}/></Route>
              <Route path="/results"><Results /></Route>
              <Route path="/usertrans"><Usertrans orders={this.state.orders} /></Route>
              <Route path="/transactions"><Transactions transfered={this.state.transfered} received={this.state.received}/></Route>
              <Route path="/details"><Details /></Route>
              <Route path="/order"><Order /></Route>
              <Route path="/ai-insights"><AnomalyDashboard orders={this.state.orders} /></Route>
              <Route path="/blockchain-console"><BlockchainConsole consumerRequests={this.state.consumerRequests} /></Route>
              <Route path="/"><Home /></Route>
            </Switch>
          </main>
        </div>
      </Router>
    );
  }
}

function mapStateToProps(state) { return { contractsLoaded: pdsLoadedSelector(state) } }
export default connect(mapStateToProps)(App)
