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
            
            // Also fetch the inventory for this shop
            const itemIdsToCheck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const quantities = await pds.methods.getShopCatalogue(this.state.id, itemIdsToCheck).call();
            
            let inventory = [];
            for(let i=0; i<itemIdsToCheck.length; i++) {
                if(parseInt(quantities[i]) > 0) {
                    try {
                        const itemData = await pds.methods.items(itemIdsToCheck[i]).call();
                        inventory.push({
                            id: itemIdsToCheck[i],
                            name: itemData.name,
                            price: itemData.price,
                            quantity: quantities[i]
                        });
                    } catch(e) {}
                }
            }

            this.setState({
                shop:shop,
                shopLoaded:true,
                inventory: inventory
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
    showInventory = () => {
        if (!this.state.inventory || this.state.inventory.length === 0) {
            return (
                <div className="glass-panel fade-in" style={{padding: '1.5rem', marginTop: '1rem'}}>
                    <p style={{color: 'var(--text-3)', margin: 0}}>No inventory data for this shop.</p>
                </div>
            )
        }
        return (
            <div className="glass-panel fade-in" style={{padding: '1.5rem', marginTop: '1rem'}}>
                <h4 style={{color: 'var(--text-1)', marginBottom: '1rem', fontWeight: 700}}>Shop Inventory</h4>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px'}}>
                    {this.state.inventory.map(item => (
                        <div key={item.id} style={{padding: '12px', background: 'var(--surface-3)', borderRadius: '8px', border: '1px solid var(--border-subtle)'}}>
                            <div style={{fontWeight: 600, color: 'var(--accent)', marginBottom: '4px'}}>{item.name}</div>
                            <div style={{display: 'flex', justifyContent: 'space-between', color: 'var(--text-2)', fontSize: '0.85rem'}}>
                                <span>Stock: <strong style={{color: '#86efac'}}>{item.quantity} kg</strong></span>
                                <span>₹{item.price}/kg</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    render() {
        return (
            <div className="page-wrapper fade-in">
                <div className="form-card glass-panel" style={{marginTop: '0'}}>
                    <h3 style={{marginBottom: '1.5rem', color: 'var(--text-1)', fontWeight: '700'}}>Shop Details</h3>
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
                {this.state.shopLoaded ? this.showInventory() : null}
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
