import React, { Component } from 'react'
import { Form, Button, InputGroup, FormControl} from 'react-bootstrap'
import './App.css';
import { connect } from 'react-redux'
import {pdsSelector,accountSelector} from '../store/selectors'

class AddReceivedBags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fromId:'',
            toId:'',
            bagId:'',
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
                    placeholder="Bag Id"
                    aria-label="Bag Id"
                    aria-describedby="basic-addon1"
                    className='hr'
                    onChange = { event => this.setState({bagId:event.target.value})}
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
            fromId:this.state.fromId,
            toId:this.state.toId,
            bagIds:[this.state.bagId],
        }

          await pds.methods.receivedBags(order.fromId,order.toId,order.bagIds).send({ from: sender })
          .on('transactionHash', (hash) => {
              console.log('Received Bags', hash);
              alert('Adding Received Bags to Database successful')
          })
          .on('error',(error) => {
            console.error(error)
            window.alert(`There was an error with Transaction! or No access to database`)
          })

    }catch(err){
        this.setState({errorMessage:err.message});
    }        

};
    render() {
        return (
            <div className="page-wrapper fade-in">
                <div className='page-header'>
                    <h2 className='gradient-text'>Receive Bags</h2>
                    <p>Confirm receipt of food bags to create an immutable record on the blockchain.</p>
                </div>

                <div className="form-card glass-panel">
                    <Form className='Har' onSubmit={this.onSubmit}>
                        
                        <Form.Group className="mb-4" controlId="oid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>From ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter sender ID" onChange = { event => this.setState({fromId:event.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="did" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>To ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter receiver ID" onChange = { event => this.setState({toId:event.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="itemid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Bag IDs</Form.Label>
                            {this.state.inputs.map(input => this.Grid())}
                        </Form.Group>

                        <div className="btn-group-actions">
                            <button type="button" className="btn-outline" onClick={ (e) => this.appendInput(e) }>
                                + Add Another Bag
                            </button>
                            <Button variant="primary" type="submit">
                                Confirm Receipt
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
  
export default connect(mapStateToProps)(AddReceivedBags)