import React, { Component } from 'react'
import './App.css'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import img from '../Logo.png';

export default class Home extends Component {
    render() {
        return (
            <div className="home-hero fade-in">

                {/* Hero */}
                <div className="home-hero-top">
                    <div style={{display:'flex', justifyContent:'center', marginBottom:'1.5rem'}}>
                        <span className="home-eyebrow">
                            <span className="dot"></span>
                            Live on Local Blockchain
                        </span>
                    </div>
                    <h1 className='gradient-text'>Public Distribution<br/>System</h1>
                    <p className="subtitle">
                        A Blockchain &amp; AI-powered platform ensuring every grain of
                        food reaches the hands it was meant for — transparently and incorruptibly.
                    </p>
                </div>

                {/* Stats */}
                <div className="home-stats">
                    <div className="stat-card">
                        <span className="stat-number gradient-text">100%</span>
                        <span className="stat-label">Transparent</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number gradient-text">Web3</span>
                        <span className="stat-label">Powered</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number gradient-text">0</span>
                        <span className="stat-label">Fraud Tolerance</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number gradient-text">AI</span>
                        <span className="stat-label">Detection</span>
                    </div>
                </div>

                {/* Cards */}
                <div className="home-content">
                    <div className="home-card glass-panel">
                        <h4 className='gradient-text'>
                            <span className="icon">💡</span> The Problem
                        </h4>
                        <p>
                            India's backbone is agriculture, yet food scarcity remains a looming
                            threat due to massive systemic inefficiencies and deep-rooted corruption.
                        </p>
                        <p>
                            Rations meant for the needy are routinely diverted by corrupt officials
                            or shop owners who hoard supplies and sell them on the black market at
                            inflated prices — robbing millions of their rightful entitlement.
                        </p>
                        <p>
                            We built a Blockchain + AI solution to dismantle this system and
                            guarantee absolute transparency at every step of the supply chain.
                        </p>
                        <div className="tech-stack">
                            <span className="tech-pill">Ethereum</span>
                            <span className="tech-pill">Solidity</span>
                            <span className="tech-pill">React</span>
                            <span className="tech-pill">FastAPI</span>
                            <span className="tech-pill">Isolation Forest</span>
                        </div>
                    </div>

                    <div className="home-card glass-panel" style={{
                        display:'flex',
                        flexDirection:'column',
                        alignItems:'center',
                        justifyContent:'center',
                        gap:'1rem'
                    }}>
                        <img
                            src={img}
                            alt="PDS Logo"
                            style={{
                                width:'180px',
                                borderRadius:'16px',
                                animation:'floatY 5s ease-in-out infinite',
                                filter:'drop-shadow(0 8px 32px rgba(59,130,246,0.25))'
                            }}
                        />
                        <p style={{
                            textAlign:'center',
                            color:'var(--text-3)',
                            fontSize:'0.8rem',
                            letterSpacing:'0.5px',
                            textTransform:'uppercase',
                            fontWeight:600
                        }}>
                            Built for Dotslash 5.0
                        </p>
                    </div>
                </div>

                {/* Objective */}
                <div style={{marginTop:'1.5rem'}}>
                    <div className="home-objective glass-panel">
                        <h4 className='gradient-text'>
                            <span className="icon">🎯</span> How It Works
                        </h4>
                        <p>
                            Every bag of food is assigned a unique on-chain identifier at the state level.
                            That identifier travels immutably through district authorities to ration shops,
                            with quantities cryptographically verified at each checkpoint.
                            Our AI engine monitors every order in real-time, flagging anomalous patterns —
                            unusual quantities, off-hours orders, or suspicious item combinations — before
                            they become fraud.
                        </p>
                    </div>
                </div>

            </div>
        )
    }
}