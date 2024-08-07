import * as React from 'react';
import { useState, useEffect } from 'react';
import '../components/css/register.css';

function Register() {
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerUserName, setRegisterUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
                        <button
                            className="submit_register"
                            type="submit"
                            value="submit"
                        >
                            Create Account
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
