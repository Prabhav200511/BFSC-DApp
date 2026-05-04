import React from 'react'
import { Table} from 'react-bootstrap'


const Usertrans = ({orders})=>{
    if(!orders)
        window.alert('Error in orders!');
    return(
        <div className="page-wrapper fade-in">
                <div className="page-header">
                    <div>
                        <h3>Consumer Orders</h3>
                        <p className="page-subtitle">Fulfilled orders emitted by the contract.</p>
                    </div>
                </div>

                <div className="glass-panel card-pad">
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
                                <td className="mono">
                                {transfer.customerMetamaskAccount.slice(0, 8)}...{transfer.customerMetamaskAccount.slice(-6)}
                            </td>
                            <td><span className="badge-chip badge-purple">{transfer.shopId}</span></td>
                            <td>{transfer.itemIds.map((item, j)=><span key={j} className="badge-chip">{item}</span>)}</td>
                            <td>{transfer.eachItemQuantities.map((quantity, j)=><span key={j} className="badge-chip">{quantity}</span>)}</td>
                                <td className="mono">{transfer.time}</td>
                        </tr>
                        )
                        })}
                        
                    </tbody>
                        </Table>
                    </div>
                </div>
            </div>
    );
}

export default Usertrans;