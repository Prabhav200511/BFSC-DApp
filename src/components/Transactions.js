import React  from 'react'
import { Table} from 'react-bootstrap'


const Transactions = ({transfered,received})=>{
    if(!transfered || !received)
        window.alert('Error in transactions!');
    return(
            <div className="page-wrapper fade-in">
                <div className="page-header">
                    <div>
                        <h3>Supply Chain Transactions</h3>
                        <p className="page-subtitle">Transfers and receipts recorded on-chain.</p>
                    </div>
                </div>

                <div className="glass-panel card-pad" style={{marginBottom: '12px'}}>
                    <div className="console-section-head" style={{marginBottom: '10px'}}>
                        <h4><span style={{color: 'var(--accent-cyan)'}}>↗</span> Transferred Bags</h4>
                    </div>
                    <div className="table-container">
                        <Table hover className="table">
                    <thead>
                        <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Bag IDs</th>
                        <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transfered.map((transfer, i)=>{
                        return (
                        <tr key={i}>
                            <td><span className="badge-chip">{transfer.fromId}</span></td>
                            <td><span className="badge-chip badge-purple">{transfer.toId}</span></td>
                            <td>{transfer.Bags.map((bag, j)=><span key={j} className="badge-chip">{bag}</span>)}</td>
                                <td className="mono">{transfer.time}</td>
                        </tr>
                        )
                        })}
                    </tbody>
                        </Table>
                    </div>
                </div>

                <div className="glass-panel card-pad">
                    <div className="console-section-head" style={{marginBottom: '10px'}}>
                        <h4><span style={{color: 'var(--accent-green)'}}>↙</span> Received Bags</h4>
                    </div>
                    <div className="table-container">
                        <Table hover className="table">
                    <thead>
                        <tr>
                        <th>From</th>
                        <th>To</th>
                        <th>Bag IDs</th>
                        <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {received.map((transfer, i)=>{
                        return (
                        <tr key={i}>
                            <td><span className="badge-chip">{transfer.fromId}</span></td>
                            <td><span className="badge-chip badge-purple">{transfer.toId}</span></td>
                            <td>{transfer.Bags.map((bag, j)=><span key={j} className="badge-chip">{bag}</span>)}</td>
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


export default Transactions;