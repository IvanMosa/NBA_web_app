import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/register.css';

function Register() {
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerUserName, setRegisterUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedOptions, setSelectedOptions] = useState('');

    const handleOptionChange = (event) => {
        const value = event.target.value;

        setSelectedOptions(value);
    };
    useEffect(() => {}, []);
    const handleSubmitRegister = (e) => {
        console.log(registerUserName, registerPassword);

        fetch('http://localhost:4000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: registerUserName,
                password: registerPassword,
                roles: selectedOptions,
            }),
        })
            .then((response) => {
                console.log(response);
                if (response.status === 200) {
                    console.log('User created succesfuly');
                } else if (response.status === 500) {
                    console.log('Username exists');
                    throw new Error('Account Exists');
                } else {
                    console.log('Failed to create user');
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then((data) => console.log(data))
            .catch((error) => {
                console.log(error);
                if (error === 'Account Exists')
                    setErrorMessage('Account already exists');
                if (error === 'Registration failed')
                    setErrorMessage('Registration failed');
            });
        e.preventDefault();
    };
    return (
        <div className="home_container">
            <img
                src={`${process.env.PUBLIC_URL}/nba_pozadina.png`}
                alt="NBA Background"
                className="background-image"
            />
            <div className="registration_container">
                <div className="registraion_title">Register a new account</div>
                <div className="registration_form">
                    <form onSubmit={(event) => handleSubmitRegister(event)}>
                        <div className="registration_input">
                            <input
                                type="text"
                                name="user_name"
                                placeholder="New User Name"
                                onChange={(e) => {
                                    setRegisterUserName(e.target.value);
                                }}
                            />
                        </div>
                        <div className="registration_input">
                            <input
                                type="password"
                                name="password"
                                placeholder="Create New Password"
                                onChange={(e) => {
                                    setRegisterPassword(e.target.value);
                                }}
                            />
                        </div>
                        <div className="registerRole">
                            <h4>Odaberi uloge korisnika:</h4>
                            <div>
                                <label className="registerRoleLabel">
                                    <input
                                        type="radio"
                                        value="NBA_VIEWER"
                                        checked={
                                            selectedOptions == 'NBA_VIEWER'
                                        }
                                        onChange={handleOptionChange}
                                    />
                                    <h5>
                                        Default (Pregled početne stranice,
                                        momčadi, igrača i statistike)
                                    </h5>
                                </label>
                            </div>
                            <div>
                                <label className="registerRoleLabel">
                                    <input
                                        type="radio"
                                        value="trade"
                                        checked={selectedOptions == 'trade'}
                                        onChange={handleOptionChange}
                                    />
                                    <h5>Trade</h5>
                                </label>
                            </div>
                            <div>
                                <label className="registerRoleLabel">
                                    <input
                                        type="radio"
                                        value="delegat"
                                        checked={selectedOptions == 'delegat'}
                                        onChange={handleOptionChange}
                                    />
                                    <h5>Delegat</h5>
                                </label>
                            </div>
                            <div>
                                <label className="registerRoleLabel">
                                    <input
                                        type="radio"
                                        value="register"
                                        checked={selectedOptions == 'register'}
                                        onChange={handleOptionChange}
                                    />
                                    <h5>Registracija novih korisnika</h5>
                                </label>
                            </div>
                        </div>
                        <button
                            className="submit_register"
                            type="submit"
                            value="submit"
                        >
                            Kreiraj Korisnika
                        </button>
                    </form>
                    {errorMessage && (
                        <div className="error_message">{errorMessage}</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Register;
