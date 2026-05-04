import React, { Component } from 'react';
import './App.css';

export default class LiveEventStream extends Component {
    render() {
        const { transfered, received, orders, consumerRequests } = this.props;

        // Combine all events into one stream
        let stream = [];

        if (transfered) {
            transfered.forEach(t => stream.push({ type: 'Transfer', ...t, dateObj: new Date(t.time) }));
        }
        if (received) {
            received.forEach(r => stream.push({ type: 'Receipt', ...r, dateObj: new Date(r.time) }));
        }
        if (orders) {
            orders.forEach(o => stream.push({ type: 'Order', ...o, dateObj: new Date(o.time) }));
        }
        if (consumerRequests) {
            consumerRequests.forEach(cr => stream.push({ type: 'ConsumerRequest', ...cr, dateObj: new Date(cr.time) }));
        }

        // Sort by time descending (newest first)
        stream.sort((a, b) => b.dateObj - a.dateObj);

        return (
            <div className="live-event-stream glass-panel">
                <div className="stream-header">
                    <h4 className="gradient-text" style={{margin: 0, fontSize: '1.2rem'}}>
                        <span className="dot" style={{display: 'inline-block', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', marginRight: '8px', animation: 'pulse-ring 2s infinite'}}></span>
                        Live Blockchain Stream
                    </h4>
                </div>
                <div className="stream-content">
                    {stream.length === 0 ? (
                        <p style={{color: 'var(--text-3)', textAlign: 'center', marginTop: '2rem'}}>No events yet.</p>
                    ) : (
                        stream.map((event, index) => {
                            if (event.type === 'Transfer') {
                                return (
                                    <div className="stream-item" key={`t-${index}`}>
                                        <div className="stream-icon" style={{background: 'var(--accent-dim)', color: 'var(--accent)'}}>T</div>
                                        <div className="stream-details">
                                            <div className="stream-title">Transfer: {event.fromId} → {event.toId}</div>
                                            <div className="stream-meta">Bags: {event.Bags.join(', ')}</div>
                                            <div className="stream-time">{event.time}</div>
                                        </div>
                                    </div>
                                );
                            } else if (event.type === 'Receipt') {
                                return (
                                    <div className="stream-item" key={`r-${index}`}>
                                        <div className="stream-icon" style={{background: 'var(--green-dim)', color: '#86efac'}}>R</div>
                                        <div className="stream-details">
                                            <div className="stream-title">Receipt: {event.fromId} → {event.toId}</div>
                                            <div className="stream-meta">Bags: {event.Bags.join(', ')}</div>
                                            <div className="stream-time">{event.time}</div>
                                        </div>
                                    </div>
                                );
                            } else if (event.type === 'Order') {
                                return (
                                    <div className="stream-item" key={`o-${index}`}>
                                        <div className="stream-icon" style={{background: 'rgba(139,92,246,0.10)', color: '#c4b5fd'}}>O</div>
                                        <div className="stream-details">
                                            <div className="stream-title">Order Made at Shop {event.shopId}</div>
                                            <div className="stream-meta">Items: {event.itemIds.join(', ')} (Qty: {event.eachItemQuantities.join(', ')})</div>
                                            <div className="stream-time">{event.time}</div>
                                        </div>
                                    </div>
                                );
                            } else if (event.type === 'ConsumerRequest') {
                                return (
                                    <div className="stream-item" key={`cr-${index}`}>
                                        <div className="stream-icon" style={{background: 'var(--red-dim)', color: '#fca5a5'}}>C</div>
                                        <div className="stream-details">
                                            <div className="stream-title">Consumer Request at Shop {event.shopId}</div>
                                            <div className="stream-meta">Cost: ₹{event.estimatedCost}</div>
                                            <div className="stream-time">{event.time}</div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })
                    )}
                </div>
            </div>
        );
    }
}
