import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import './App.css'
import img from '../Logo.png';

export default class Home extends Component {
    render() {
        return (
            <div className="home-hero fade-in">
                <div className="home-hero-top">
                    <section className="home-copy glass-panel">
                        <span className="home-eyebrow">
                            <span className="dot"></span>
                            Local Ethereum Network
                        </span>
                        <h1 className='gradient-text'>Public Distribution System</h1>
                        <p className="subtitle">
                            A role-based blockchain workflow for tracking ration bags, delivery movement,
                            shop receipts, inventory attestations, and consumer orders from one laptop.
                        </p>
                        <div className="home-actions">
                            <Link to="/blockchain-console" className="btn-primary">
                                Open Web3 Console
                            </Link>
                            <Link to="/transactions" className="btn-outline">
                                View Event Ledger
                            </Link>
                        </div>
                    </section>

                    <aside className="home-network-panel glass-panel">
                        <div>
                            <img src={img} alt="PDS Logo" />
                            <div className="network-stack">
                                <div className="network-row">
                                    <span>Smart contract</span>
                                    <strong>PDS.sol</strong>
                                </div>
                                <div className="network-row">
                                    <span>Wallet layer</span>
                                    <strong>MetaMask</strong>
                                </div>
                                <div className="network-row">
                                    <span>Demo chain</span>
                                    <strong>Ganache</strong>
                                </div>
                            </div>
                        </div>
                        <div className="tech-stack">
                            <span className="tech-pill">Solidity</span>
                            <span className="tech-pill">Web3.js</span>
                            <span className="tech-pill">React</span>
                            <span className="tech-pill">FastAPI</span>
                        </div>
                    </aside>
                </div>

                <div className="home-stats">
                    <div className="stat-card">
                        <span className="stat-number gradient-text">6</span>
                        <span className="stat-label">On-chain roles</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number gradient-text">5</span>
                        <span className="stat-label">Demo wallets</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number gradient-text">Live</span>
                        <span className="stat-label">Event logs</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number gradient-text">AI</span>
                        <span className="stat-label">Fraud signal</span>
                    </div>
                </div>

                <div className="home-content">
                    <div className="home-card glass-panel">
                        <h4 className='gradient-text'>
                            <span className="icon">01</span> Trust Model
                        </h4>
                        <p>
                            State admins tokenize ration bags and assign delivery pickups. District admins
                            onboard shops and consumers. Shop owners confirm receipts and fulfill orders.
                        </p>
                        <p>
                            Every role-sensitive action is signed through MetaMask and becomes visible in
                            the immutable event stream.
                        </p>
                    </div>

                    <div className="home-card glass-panel">
                        <h4 className='gradient-text'>
                            <span className="icon">02</span> Audit Surface
                        </h4>
                        <p>
                            Transfers, receipts, consumer requests, fulfilled orders, delivery status,
                            inventory updates, and low-stock alerts are exposed as smart contract events.
                        </p>
                        <p>
                            The Web3 Console turns those logs into a clear proof layer for evaluators.
                        </p>
                    </div>
                </div>

                <div className="home-objective glass-panel">
                    <h4 className='gradient-text'>
                        <span className="icon">03</span> Demo Narrative
                    </h4>
                    <p>
                        Switch MetaMask accounts to move through each role: State Admin, District Admin,
                        Consumer, Delivery Agent, and Shop Owner. The counters, transaction hashes, and
                        event table update as the workflow progresses.
                    </p>
                </div>
            </div>
        )
    }
}
