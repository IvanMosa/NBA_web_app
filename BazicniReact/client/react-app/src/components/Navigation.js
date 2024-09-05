import * as React from 'react';
import '../components/css/navigation.css';
import { LuUserCircle2 } from 'react-icons/lu';
import { BsHouseDoor } from 'react-icons/bs';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import * as actions from '../redux/actionTypes';
import Tutorial from '../components/library_css/Tutorial';
import './css/navigation.css';

function Navigation({ roles = {} }) {
    const [showTutorial, setShowTutorial] = useState(false);
    const [clicked, setClicked] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return (
        <div className="navigation-container">
            <div className="navigation-tabs">
                {(roles.includes('PREGLED') || roles == 'ADMIN') && (
                    <div className="navigation-tab">
                        <Link to="/">
                            <BsHouseDoor className="luser" />
                        </Link>
                    </div>
                )}
                {(roles.includes('PREGLED') || roles == 'ADMIN') && (
                    <div className="navigation-tab">
                        <Link to="/tablica">Tablica</Link>
                    </div>
                )}
                {(roles.includes('TRADE') || roles == 'ADMIN') && (
                    <div className="navigation-tab">
                        <Link to="/trade">Trade players</Link>
                    </div>
                )}
                {(roles.includes('PREGLED') || roles == 'ADMIN') && (
                    <div className="navigation-tab">
                        <Link to="/Statistika">Statistika</Link>
                    </div>
                )}
                {(roles.includes('DELEGAT') || roles == 'ADMIN') && (
                    <div className="navigation-tab">
                        <Link to="/Delegat">Delegat</Link>
                    </div>
                )}
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
                            <Tutorial
                                setClickedNavigation={setClicked}
                                roles={roles}
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="navigation-logOut">
                {roles == 'ADMIN' && (
                    <div className="navigation-logOut1">
                        <Link to="/admin">
                            <LuUserCircle2 className="luser" />
                        </Link>
                    </div>
                )}
                <div
                    className="navigation-logOut1"
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('roles');
                        dispatch({
                            type: actions.USER_LOGGED_OUT,
                        });
                        navigate('/');
                    }}
                >
                    Log out
                </div>
            </div>
        </div>
    );
}

export default Navigation;
