import * as React from 'react';
import '../components/css/navigation.css';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import * as actions from '../redux/actionTypes';
import Tutorial from '../components/library_css/Tutorial';
import './css/navigation.css';

function Navigation({ roles }) {
    const [showTutorial, setShowTutorial] = useState(false);
    const [clicked, setClicked] = useState(null);
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
                {roles.includes('trade') ||
                    (roles == 'all' && (
                        <div className="navigation-tab">
                            <Link to="/trade">Trade players</Link>
                        </div>
                    ))}
                <div className="navigation-tab">
                    <Link to="/Statistika">Statistika</Link>
                </div>
                {roles.includes('delegat') ||
                    (roles == 'all' && (
                        <div className="navigation-tab">
                            <Link to="/Delegat">Delegat</Link>
                        </div>
                    ))}
                <div className="navigation-tab">
                    <Link to="/Search">Traži</Link>
                </div>
                <div
                    className="navigation-tab tutorial-tab"
                    onMouseEnter={() => setShowTutorial(true)}
                    onMouseLeave={() => {
                        if (!clicked) setShowTutorial(false);
                    }}
                >
                    <Link to="#">Tutorial</Link>
                    {showTutorial && (
                        <div className="tutorial-dropdown">
                            <Tutorial setClickedNavigation={setClicked} />
                        </div>
                    )}
                </div>
            </div>

            <div className="navigation-logOut">
                {roles.includes('register') ||
                    (roles == 'all' && (
                        <div className="navigation-logOut1">
                            <Link to="/register">Register User</Link>
                        </div>
                    ))}
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
