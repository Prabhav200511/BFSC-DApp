import React, { Component } from 'react'
import { Form, Button, InputGroup, FormControl} from 'react-bootstrap'
import './App.css';
import { connect } from 'react-redux'
import {pdsSelector,accountSelector} from '../store/selectors'

class Order extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address:'',
            shopId:'',
            itemId:'',
            quantity:'', 
            inputs: ['input-0']
        }
    }
        appendInput(event) {
            event.preventDefault();
            var newInput = `input-${this.state.inputs.length}`;
            this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput])}));
        }
    
Grid=(input)=>{
        return(
            <div>
                <InputGroup className="mb-3">
                    <FormControl
                    placeholder="Item Id"
                    aria-label="Item Id"
                    aria-describedby="basic-addon1"
                    className='hr'
                    onChange = { event => this.setState({itemId:event.target.value})}
                    />
                    <FormControl
                    placeholder="Quantity (Kg)"
                    aria-label="Item Quantity"
                    aria-describedby="basic-addon2"
                    className='hr'
                    onChange = { event => this.setState({quantity:event.target.value})}
                    />
                </InputGroup>
            </div>
        )
}

onSubmit = async(event)=>{
    event.preventDefault();
    const {pds,sender}=this.props
    try{
        const order = {
            address:this.state.address,
            shopId:this.state.shopId,
            itemId:[this.state.itemId],
            quantity:[this.state.quantity]
        }
        console.log("order 11",order);
          await pds.methods.orderMade(order.address,order.shopId,order.itemId,order.quantity).send({ from: sender })
          .on('transactionHash', (hash) => {
            console.log('Order of Consumer', hash);
            alert('Adding Orders to Database successful')

        })
        .on('error',(error) => {
          console.error(error)
          window.alert(`There was an error with Order Made or No access to the database`)
        })

    }catch(err){
        this.setState({errorMessage:err.message});
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
                        
                        <Form.Group className="mb-4" controlId="oid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Consumer Account</Form.Label>
                            <Form.Control type="text" placeholder="Enter consumer wallet address" onChange = { event => this.setState({address:event.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="did" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Shop ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter shop ID" onChange = { event => this.setState({shopId:event.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="itemid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Items & Quantities</Form.Label>
                            {this.state.inputs.map(input => this.Grid())}
                        </Form.Group>

                        <div className="btn-group-actions">
                            <button type="button" className="btn-outline" onClick={ (e) => this.appendInput(e) }>
                                + Add Another Item
                            </button>
                            <Button variant="primary" type="submit">
                                Submit Order
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
  
export default connect(mapStateToProps)(Order)