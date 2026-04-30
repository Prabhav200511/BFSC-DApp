import React from 'react'
import { Navbar, Nav} from 'react-bootstrap'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

import Home from './Home';
import Order from './Order';
import Details from './Details';
import Transactions from './Transactions';
import Usertrans from './Usertrans';
import Results from './Results';
import Districtres from './Districtres';
import Transfer from './Transfer';
import AddReceivedBags from './AddReceivedBags';
import AnomalyDashboard from './AnomalyDashboard';
import img from '../pds_logo.png';

const NavbarComp=({transfered,received, orders})=>{
        return (
            <Router>
                <div className='navb'>

                    <Navbar bg="transparent" variant={"dark"} expand="lg" className='nvb'>
                        <Navbar.Brand as={Link} to="/">
                            <img src={img} width='46px' alt='PDS' style={{borderRadius: '10px'}}/>
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbarScroll" />
                        <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="ml-auto my-2 my-lg-0"
                                style={{ flexWrap: 'wrap' }}
                                navbarScroll
                            >
                                <Nav.Link as={Link} to="/home" className='header'>Home</Nav.Link>
                                <Nav.Link as={Link} to="/details" className='header'>Shop&nbsp;Lookup</Nav.Link>
                                <Nav.Link as={Link} to="/order" className='header'>Make&nbsp;Order</Nav.Link>
                                <Nav.Link as={Link} to="/transfer" className='header'>Transfer&nbsp;Bags</Nav.Link>
                                <Nav.Link as={Link} to="/AddReceivedBags" className='header'>Receive&nbsp;Bags</Nav.Link>
                                <Nav.Link as={Link} to="/transactions" className='header'>Transactions</Nav.Link>
                                <Nav.Link as={Link} to="/usertrans" className='header'>Orders</Nav.Link>
                                <Nav.Link as={Link} to="/districtres" className='header'>Districts</Nav.Link>
                                <Nav.Link as={Link} to="/ai-insights" className='header' style={{color: 'var(--accent-cyan)'}}>✨ AI Insights</Nav.Link>
                            </Nav>

                        </Navbar.Collapse>
                    </Navbar>
                </div>
                <div>
                    <Switch>

                    <Route path="/transfer">
                            <Transfer />
                        </Route>
                    <Route path="/AddReceivedBags">
                            <AddReceivedBags />
                    </Route>

                    <Route path="/districtres">
                        <Districtres transfered={transfered} received={received} orders={orders}/>
                        </Route>

                    <Route path="/results">
                            <Results />
                        </Route>

                        <Route path="/usertrans">
                            <Usertrans orders={orders} />
                        </Route> 

                        <Route path="/transactions">
                            <Transactions transfered={transfered} received={received}/>
                        </Route>

                        <Route path="/details">
                            <Details />
                        </Route>

                        <Route path="/order">
                            <Order />
                        </Route>

                        <Route path="/ai-insights">
                            <AnomalyDashboard orders={orders} />
                        </Route>

                        <Route path="/">
                            <Home />
                        </Route>
                        
                    </Switch>
                </div>
            </Router>
)}

export default NavbarComp;
