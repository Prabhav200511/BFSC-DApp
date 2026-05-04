import React, { Component } from 'react'
import { Form, Button, InputGroup, FormControl, Alert } from 'react-bootstrap'
import { withRouter, Link } from 'react-router-dom'
import './App.css';
import { connect } from 'react-redux'
import {pdsSelector,accountSelector} from '../store/selectors'

class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address:'',
            shopId:'',
            lineItems:[{ itemId:'', quantity:'' }],
            loading:false,
            statusMessage:'',
            errorMessage:'',
            fromPendingRequest:false
        }
    }

    componentDidMount() {
        this.applyPendingOrderFromRoute()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location !== this.props.location) {
            this.applyPendingOrderFromRoute()
        }
    }

    applyPendingOrderFromRoute() {
        const location = this.props.location || {}
        const routeOrder = location.state && location.state.pendingOrder
        const query = new URLSearchParams(location.search || '')
        const queryOrder = query.get('consumer') ? {
            address: query.get('consumer'),
            shopId: query.get('shopId'),
            itemIds: (query.get('items') || '').split(',').filter(Boolean),
            quantities: (query.get('quantities') || '').split(',').filter(Boolean)
        } : null
        const pendingOrder = routeOrder || queryOrder
        if (!pendingOrder) return

        const itemIds = pendingOrder.itemIds || []
        const quantities = pendingOrder.quantities || []
        const lineItems = itemIds.length > 0
            ? itemIds.map((itemId, index) => ({
                itemId: String(itemId),
                quantity: String(quantities[index] || '')
            }))
            : [{ itemId:'', quantity:'' }]

        this.setState({
            address: pendingOrder.address || '',
            shopId: pendingOrder.shopId || '',
            lineItems: lineItems,
            fromPendingRequest: true,
            statusMessage: 'Pending request loaded. Review the values, then submit with the Shop Owner wallet.',
            errorMessage: ''
        })
    }
    appendInput(event) {
        event.preventDefault();
        this.setState(prevState => ({ lineItems: prevState.lineItems.concat([{ itemId:'', quantity:'' }])}));
    }

    updateLineItem(index, field, value) {
        this.setState(prevState => {
            const lineItems = prevState.lineItems.slice();
            lineItems[index] = {
                ...lineItems[index],
                [field]: value
            };
            return { lineItems };
        });
    }
    
Grid=(lineItem,index)=>{
        return(
            <div key={`order-line-${index}`}>
                <InputGroup className="mb-3">
                    <FormControl
                    placeholder="Item Id"
                    aria-label="Item Id"
                    aria-describedby="basic-addon1"
                    className='hr'
                    value={lineItem.itemId}
                    disabled={this.state.loading}
                    onChange = { event => this.updateLineItem(index, 'itemId', event.target.value)}
                    />
                    <FormControl
                    placeholder="Quantity (Kg)"
                    aria-label="Item Quantity"
                    aria-describedby="basic-addon2"
                    className='hr'
                    value={lineItem.quantity}
                    disabled={this.state.loading}
                    onChange = { event => this.updateLineItem(index, 'quantity', event.target.value)}
                    />
                </InputGroup>
            </div>
        )
}

onSubmit = async(event)=>{
    event.preventDefault();
    const {pds,sender}=this.props
    this.setState({ loading:true, statusMessage:'', errorMessage:'' })
    try{
        const validLineItems = this.state.lineItems.filter((lineItem) => lineItem.itemId !== '' && lineItem.quantity !== '');
        if(!pds) {
            throw new Error('PDS contract is not loaded. Connect MetaMask to the Ganache network and refresh.')
        }
        if(!sender) {
            throw new Error('Connect MetaMask with the Shop Owner wallet first.')
        }
        if(!this.state.address || !this.state.shopId || validLineItems.length === 0) {
            throw new Error('Consumer account, shop ID, and at least one item are required.')
        }
        const order = {
            address:this.state.address,
            shopId:this.state.shopId,
            itemId:validLineItems.map((lineItem) => lineItem.itemId),
            quantity:validLineItems.map((lineItem) => lineItem.quantity)
        }
        console.log("order 11",order);
        const receipt = await pds.methods.orderMade(order.address,order.shopId,order.itemId,order.quantity).send({ from: sender })
        console.log('Order of Consumer', receipt.transactionHash);
        this.setState({
            loading:false,
            statusMessage:`Order fulfilled on-chain in block ${receipt.blockNumber}. Returning to the Web3 Console so the pending queue can refresh.`,
            errorMessage:'',
            fromPendingRequest:false
        })
        setTimeout(() => {
            if(this.props.history) this.props.history.push('/blockchain-console')
        }, 1200)

    }catch(err){
        this.setState({errorMessage:err.message, loading:false});
    }        
};
    render() {
        return (
            <div className="page-wrapper fade-in">
                <div className='page-header'>
                    <h2 className='gradient-text'>Make an Order</h2>
                    <p>Record a consumer's order at a ration shop. This creates a permanent, tamper-proof receipt.</p>
                </div>

                <div className="form-card glass-panel">
                    <Form className='Har' onSubmit={this.onSubmit}>
                        {this.state.fromPendingRequest && (
                            <div className="pending-order-banner">
                                <div>
                                    <strong>Pending request selected</strong>
                                    <span>Consumer, shop, item ID, and quantity were autofilled from the blockchain request event.</span>
                                </div>
                                <Link to="/blockchain-console" className="text-link">Back to console</Link>
                            </div>
                        )}

                        <div className="order-feedback-stack">
                            {this.state.statusMessage && <Alert variant="info">{this.state.statusMessage}</Alert>}
                            {this.state.errorMessage && <Alert variant="danger">{this.state.errorMessage}</Alert>}
                        </div>
                        
                        <Form.Group className="mb-4" controlId="oid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Consumer Account</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter consumer wallet address"
                                value={this.state.address}
                                disabled={this.state.loading}
                                onChange = { event => this.setState({address:event.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="did" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Shop ID</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter shop ID"
                                value={this.state.shopId}
                                disabled={this.state.loading}
                                onChange = { event => this.setState({shopId:event.target.value})}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="itemid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Items & Quantities</Form.Label>
                            {this.state.lineItems.map((lineItem, index) => this.Grid(lineItem, index))}
                        </Form.Group>

                        <div className="btn-group-actions">
                            <button type="button" className="btn-outline" disabled={this.state.loading} onClick={ (e) => this.appendInput(e) }>
                                + Add Another Item
                            </button>
                            <Button variant="primary" type="submit" disabled={this.state.loading}>
                                {this.state.loading ? 'Submitting...' : 'Submit Order'}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
  
    return {
        sender: accountSelector(state),
      pds: pdsSelector(state),
    }
  }
  
export default withRouter(connect(mapStateToProps)(Order))
