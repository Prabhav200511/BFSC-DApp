import React, { Component } from 'react'
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
    { to: "/", label: "Home", icon: "⌂", exact: true },
    { to: "/blockchain-console", label: "Web3 Console", icon: "◈" },
    { to: "/details", label: "Shop Lookup", icon: "⊞" },
    { to: "/order", label: "Make Order", icon: "⊕" },
    { to: "/transfer", label: "Transfer Bags", icon: "↗" },
    { to: "/AddReceivedBags", label: "Receive Bags", icon: "↙" },
    { to: "/transactions", label: "Transactions", icon: "≡" },
    { to: "/usertrans", label: "Orders", icon: "☰" },
    { to: "/districtres", label: "Districts", icon: "▦" },
    { to: "/ai-insights", label: "AI Insights", icon: "◉" },
];

class NavbarComp extends Component {
    state = { collapsed: false }

    toggle = () => this.setState(prev => ({ collapsed: !prev.collapsed }))

    render() {
        const { collapsed } = this.state;
        return (
            <aside className={`app-sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
                <div className="sidebar-brand">
                    <span className="sidebar-logo">PDS</span>
                    {!collapsed && <span className="sidebar-title">Supply Chain</span>}
                    <button className="sidebar-toggle" onClick={this.toggle} title={collapsed ? 'Expand' : 'Collapse'}>
                        {collapsed ? '»' : '«'}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            exact={item.exact}
                            className="sidebar-link"
                            activeClassName="sidebar-link--active"
                            title={item.label}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    {!collapsed && <span className="sidebar-footnote">Blockchain PDS v2</span>}
                </div>
            </aside>
        );
    }
}

export default NavbarComp;
