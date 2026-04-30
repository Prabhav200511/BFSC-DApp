import React, { Component } from 'react';
import { Table, Spinner, Badge } from 'react-bootstrap';
import moment from 'moment';

export default class AnomalyDashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            results: [],
            error: null
        };
    }

    componentDidMount() {
        this.analyzeOrders();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.orders !== this.props.orders) {
            this.analyzeOrders();
        }
    }

    async analyzeOrders() {
        const { orders } = this.props;
        if (!orders || orders.length === 0) {
            this.setState({ loading: false, results: [] });
            return;
        }

        this.setState({ loading: true, error: null });

        try {
            // Transform orders to match the Python API expectations
            const aiPayload = orders.map((o, idx) => {
                // Sum all quantities
                const totalQuantity = o.eachItemQuantities.reduce((acc, val) => acc + parseInt(val), 0);
                
                // Parse hour from the formatted time string using moment
                const hourOfDay = moment(o.time, 'dddd, MMMM Do, YYYY h:mm:ss A').hour();

                return {
                    id: `ORDER-${idx}-${o.shopId}`,
                    shop_id: parseInt(o.shopId),
                    total_quantity: totalQuantity,
                    item_count: o.itemIds.length,
                    hour_of_day: hourOfDay
                };
            });

            const response = await fetch('http://localhost:8000/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(aiPayload)
            });

            if (!response.ok) {
                throw new Error(`AI API returned status ${response.status}`);
            }

            const data = await response.json();
            
            // Merge results back with original orders for display
            const mergedResults = orders.map((o, idx) => {
                const apiResult = data.anomalies.find(a => a.id === `ORDER-${idx}-${o.shopId}`);
                return {
                    ...o,
                    ai: apiResult || { is_anomaly: false, reason: "Analysis failed", anomaly_score: 0 }
                };
            });

            this.setState({ results: mergedResults, loading: false });

        } catch (err) {
            console.error("AI Analysis Error:", err);
            this.setState({ error: "Failed to connect to the AI Engine. Ensure it is running on port 8000.", loading: false });
        }
    }

    render() {
        const { loading, results, error } = this.state;

        return (
            <div className="page-wrapper fade-in">
                <div className='page-header'>
                    <h2 className='gradient-text'>AI Insights & Fraud Detection</h2>
                    <p>Real-time anomaly detection powered by Machine Learning (Isolation Forest).</p>
                </div>

                {error && (
                    <div className="alert alert-danger" style={{borderRadius: '12px'}}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{display: 'flex', justifyContent: 'center', margin: '3rem 0'}}>
                        <Spinner animation="border" style={{color: 'var(--accent-cyan)'}} />
                    </div>
                ) : (
                    <div className="table-container glass-panel">
                        <Table hover className="table">
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Shop ID</th>
                                    <th>Customer</th>
                                    <th>Total Items</th>
                                    <th>AI Score</th>
                                    <th>Reason</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center" style={{padding: '2rem'}}>No orders to analyze.</td>
                                    </tr>
                                ) : (
                                    results.map((r, i) => {
                                        const isAnom = r.ai.is_anomaly;
                                        return (
                                            <tr key={i} style={{ backgroundColor: isAnom ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                                                <td>
                                                    {isAnom ? (
                                                        <Badge bg="danger" style={{padding: '0.5em 0.8em'}}>Fraud Alert</Badge>
                                                    ) : (
                                                        <Badge bg="success" style={{padding: '0.5em 0.8em'}}>Clean</Badge>
                                                    )}
                                                </td>
                                                <td><span className="badge-chip badge-purple">{r.shopId}</span></td>
                                                <td style={{fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-muted)'}}>
                                                    {r.customerMetamaskAccount.substring(0,8)}...
                                                </td>
                                                <td>{r.itemIds.length} types</td>
                                                <td style={{fontFamily: 'monospace', color: isAnom ? '#ef4444' : '#10b981'}}>
                                                    {r.ai.anomaly_score}
                                                </td>
                                                <td style={{color: isAnom ? '#ef4444' : 'var(--text-color)'}}>
                                                    {r.ai.reason}
                                                </td>
                                                <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>{r.time}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>
                )}
            </div>
        );
    }
}
