import React  from 'react'
import { Table} from 'react-bootstrap'


const Transactions = ({transfered,received})=>{
    if(!transfered || !received)
        window.alert('Error in transactions!');
    return(
            <div className="page-wrapper fade-in">
                <div className='page-header'>
                    <h2 className='gradient-text'>Supply Chain Transactions</h2>
                    <p>All bag transfers and receipts recorded on the blockchain.</p>
                </div>

                <h4 style={{marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem'}}>
                    <span style={{color: 'var(--accent-cyan)'}}>↗</span> Transferred Bags
                </h4>
                <div className="table-container" style={{marginBottom: '2.5rem'}}>
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
                            <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{transfer.time}</td>
                        </tr>
                        )
                        })}
                    </tbody>
                    </Table>
                </div>

                <h4 style={{marginBottom: '1rem', fontWeight: 600, fontSize: '1.1rem'}}>
                    <span style={{color: 'var(--accent-green)'}}>↙</span> Received Bags
                </h4>
                <div className="table-container" style={{marginBottom: '2rem'}}>
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


export default Transactions;