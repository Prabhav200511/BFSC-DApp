import React, { Component } from 'react'
import './App.css'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import img from '../Logo.png';

export default class Home extends Component {
    render() {
        return (
            <div className="home-hero fade-in">
                <div className="home-hero-top">
                    <h1 className='gradient-text'>Public Distribution System</h1>
                    <p className="subtitle">Transparent & Secure Food Supply Chain — powered by Blockchain</p>
                </div>

                <div className="home-stats" style={{marginBottom: '2.5rem'}}>
                    <div className="stat-card glass-panel">
                        <span className="stat-number gradient-text">100%</span>
                        <span className="stat-label">Transparent</span>
                    </div>
                    <div className="stat-card glass-panel">
                        <span className="stat-number gradient-text">Web3</span>
                        <span className="stat-label">Powered</span>
                    </div>
                    <div className="stat-card glass-panel">
                        <span className="stat-number gradient-text">0</span>
                        <span className="stat-label">Fraud Tolerance</span>
                    </div>
                </div>
                
                <div className="home-content">
                    <div className="home-card glass-panel">
                        <h4 className='gradient-text'>
                            <span className="icon">💡</span> Inspiration
                        </h4>
                        <p>
                            India's backbone is agriculture, yet food scarcity remains a looming threat due to massive systemic inefficiencies and corruption.
                        </p>
                        <p>
                            Far too often, rations meant for the needy are diverted by corrupt officials or shop owners who hoard supplies to sell them on the black market at inflated prices.
                        </p>
                        <p>
                            We wanted to dismantle this corrupt system — so we built a Blockchain and AI-powered solution to ensure absolute transparency and automatically detect fraudulent activities at every step.
                        </p>
                    </div>

                    <div className="home-card glass-panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                        <img 
                            src={img} 
                            alt="PDS Logo" 
                            style={{
                                width: '220px', 
                                borderRadius: '16px',
                                marginBottom: '1rem',
                                animation: 'float 4s ease-in-out infinite'
                            }} 
                        />
                        <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                            Built for Dotslash 5.0
                        </p>
                    </div>
                </div>
                
                <div className="home-objective glass-panel">
                    <h4 className='gradient-text'>
                        <span className="icon">🎯</span> Objective
                    </h4>
                    <p>
                        We provide transparency in the food supply chain using Blockchain. 
                        Each bag of food is tracked from origin to end-user using unique identifiers 
                        stored immutably on the blockchain at every checkpoint. 
                        The state government generates these identifiers, which travel through district 
                        authorities to ration shops. Quantities are verified at each stage, 
                        ensuring zero fraud or corruption.
                    </p>
                </div>
            </div>
        )
    }
}