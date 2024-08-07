import * as React from 'react';
import '../components/css/navigation.css';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../redux/actionTypes';
import './css/navigation.css';

function Navigation() {
    const dispatch = useDispatch();
    return (
        <div className="navigation-container">
            <div className="navigation-tabs">
                <div className="navigation-tab">
                    <Link to="/">Home</Link>
                </div>
                <div className="navigation-tab">
                    <Link to="/tablica">Tablica</Link>
                </div>
                <div className="navigation-tab">
                    <Link to="/trade">Trade players</Link>
                </div>
                <div className="navigation-tab">
                    <Link to="/Statistika">Statistika</Link>
                </div>
                <div className="navigation-tab">
                    <Link to="/Delegat">Delegat</Link>
                </div>
            </div>

            <div className="navigation-logOut">
                <div className="navigation-logOut1">
                    <Link to="/register">Register User</Link>
                </div>
                <div
                    className="navigation-logOut1"
                    onClick={() => {
                        dispatch({
                            type: actions.USER_LOGGED_OUT,
                        });
                    }}
                >
                    Log out
                </div>
            </div>
        </div>
    );
}

export default Navigation;
