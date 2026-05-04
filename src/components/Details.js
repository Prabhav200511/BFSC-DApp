import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import {pdsSelector} from '../store/selectors'

class Details extends Component {
    state = {
        id:'',
        errorMessage:'',
        loading:false,
        shop:{
            id:'',
            name:'',
            address:'',
            location:'',
        },
        shopLoaded:false
    };

    onSubmit = async(event)=>{
        event.preventDefault();
        this.setState({loading:true,errorMessage:''});
        const {pds}=this.props
        try{
            const shop = await pds.methods.shops(this.state.id).call();
            this.setState({
                shop:shop,
                shopLoaded:true
            })
        }catch(e){
            this.setState({
                errorMessage:e
            })
        }
        this.setState({        
            loading:false,
        });
    };

    showCard=()=>{
        return(
            <div className='shop-result-card glass-panel fade-in'>
                <div className='shop-name gradient-text'>{this.state.shop.name || 'Unknown Shop'}</div>
                <div className='shop-info-row'>
                    <span className='info-label'>Shop ID</span>
                    <span className='info-value'>{this.state.shop.id}</span>
                </div>
                <div className='shop-info-row'>
                    <span className='info-label'>Account</span>
                    <span className='info-value' style={{fontSize: '0.82rem', fontFamily: 'monospace'}}>{this.state.shop.account}</span>
                </div>
                <div className='shop-info-row'>
                    <span className='info-label'>Location</span>
                    <span className='info-value'>{this.state.shop.location}</span>
                </div>
            </div>
        )
    }
    render() {
        return (
            <div className="page-wrapper fade-in">
                <div className='page-header'>
                    <h2 className='gradient-text'>Shop Details</h2>
                    <p>Enter a Shop ID below to look up its registered information on the blockchain.</p>
                </div>
                
                <div className="form-card glass-panel">
                    <Form onSubmit={this.onSubmit} className='Har'>
                        <Form.Group className="mb-4" controlId="formBasicId" style={{width: '100%', textAlign: 'left'}}>
                            <Form.Label>Shop ID</Form.Label>
                            <Form.Control type="text" placeholder="e.g. 100" onChange = { event => this.setState({id:event.target.value})}/>
                        </Form.Group>

                        <Button variant="primary" type="submit" disabled={this.state.loading}>
                            {this.state.loading ? 'Searching...' : 'Search Shop'}
                        </Button>
                    </Form>
                </div>
                {this.state.shopLoaded ? this.showCard() : null}
            </div>
        )
    }
}

function mapStateToProps(state) {
  
    return {
      pds: pdsSelector(state),
    }
  }
  
export default connect(mapStateToProps)(Details)
