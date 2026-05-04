import React, { Component } from 'react'
import { Form, Button, InputGroup, FormControl} from 'react-bootstrap'
import './App.css';
import { connect } from 'react-redux'
import {pdsSelector,accountSelector} from '../store/selectors'

class Transfer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fromId:'',
            toId:'',
            bagIds:['']
        }
    }
        appendInput(event) {
            event.preventDefault();
            this.setState(prevState => ({ bagIds: prevState.bagIds.concat([''])}));
        }

        updateBagId(index, value) {
            this.setState(prevState => {
                const bagIds = prevState.bagIds.slice();
                bagIds[index] = value;
                return { bagIds };
            });
        }
    
Grid=(bagId,index)=>{
        return(
            <div key={`bag-${index}`}>
                <InputGroup className="mb-3">
                    <FormControl
                    placeholder="Bag Id"
                    aria-label="Bag Id"
                    aria-describedby="basic-addon1"
                    className='hr'
                    value={bagId}
                    onChange = { event => this.updateBagId(index, event.target.value)}
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
            bagIds:this.state.bagIds.filter((bagId) => bagId !== ''),
        }

          await pds.methods.transferedBags(order.fromId,order.toId,order.bagIds).send({ from: sender })
          .on('transactionHash', (hash) => {
              console.log('Add Transfered Bags', hash);
              alert('Adding Transfered Bags to Database successful')

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
                    <h2 className='gradient-text'>Transfer Bags</h2>
                    <p>Record the transfer of food bags from one authority to another on the blockchain.</p>
                </div>

                <div className="form-card glass-panel">
                    <Form className='Har' onSubmit={this.onSubmit}>
                        
                        <Form.Group className="mb-4" controlId="oid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>From ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter source ID" onChange = { event => this.setState({fromId:event.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="did" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>To ID</Form.Label>
                            <Form.Control type="text" placeholder="Enter destination ID" onChange = { event => this.setState({toId:event.target.value})}/>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="itemid" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Bag IDs</Form.Label>
                            {this.state.bagIds.map((bagId, index) => this.Grid(bagId, index))}
                        </Form.Group>

                        <div className="btn-group-actions">
                            <button type="button" className="btn-outline" onClick={ (e) => this.appendInput(e) }>
                                + Add Another Bag
                            </button>
                            <Button variant="primary" type="submit">
                                Submit Transfer
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
  
export default connect(mapStateToProps)(Transfer)
