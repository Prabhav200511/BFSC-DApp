import React from 'react'
import { Table} from 'react-bootstrap'


const Usertrans = ({orders})=>{
    if(!orders)
        window.alert('Error in orders!');
    return(
        <div className="page-wrapper fade-in">
                <div className='page-header'>
                    <h2 className='gradient-text'>Consumer Orders</h2>
                    <p>All consumer purchase transactions recorded on the blockchain.</p>
                </div>

                <div className="table-container">
                    <Table hover className="table">
                    <thead>
                        <tr>
                        <th>Consumer Account</th>
                        <th>Shop ID</th>
                        <th>Items</th>
                        <th>Qty (Kg)</th>
                        <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((transfer, i)=>{
                        return (
                        <tr key={i}>
                            <td style={{fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                                {transfer.customerMetamaskAccount.slice(0, 8)}...{transfer.customerMetamaskAccount.slice(-6)}
                            </td>
                            <td><span className="badge-chip badge-purple">{transfer.shopId}</span></td>
                            <td>{transfer.itemIds.map((item, j)=><span key={j} className="badge-chip">{item}</span>)}</td>
                            <td>{transfer.eachItemQuantities.map((quantity, j)=><span key={j} className="badge-chip">{quantity}</span>)}</td>
                            <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{transfer.time}</td>
                        </tr>
                        )
                        })}
                        
                    </tbody>
                    </Table>
                </div>
            </div>
    );
}

export default Usertrans;