import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as actions from '../redux/actionTypes';
import '../components/css/login.css';

function Login() {
    const [loginPassword, setLoginPassword] = useState('');
    const [loginUserName, setLoginUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const dispatch = useDispatch();
    useEffect(() => {}, []);
    const handleSubmitLogin = (e) => {
        fetch('http://localhost:4000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userName: loginUserName,
                password: loginPassword,
            }),
        })
            .then((response) => {
                console.log(response);
                if (response.status === 200) {
                    return response.json();
                } else if (response.status === 201) {
                    throw new Error('Korisnički račun zaključan!');
                } else {
                    throw new Error('Login Failed');
                }
            })
            .then((data) => {
                dispatch({
                    type: actions.USER_LOGGED_IN,
                    payload: {
                        token: data.token,
                        refreshToken: data.refreshToken,
                        roles: data.roles,
                    },
                });
                setErrorMessage(' ');
            })

            .catch((error) => {
                console.log(error);
                if (error == 'Korisnički račun zaključan!')
                    setErrorMessage('Korisnički račun zaključan!');
                else if (error == 'Login Failed')
                    setErrorMessage('Pogrešno korisničko ime ili lozinka!');
            });
        e.preventDefault();
    };
    return (
        <div className="login_container">
            <div className="loginRegistration_title">Welcome to NBA!</div>
            <div className="loginRegistration_form">
                <form onSubmit={(event) => handleSubmitLogin(event)}>
                    <div className="input_container">
                        <input
                            type="text"
                            name="user_name"
                            placeholder="User Name"
                            onChange={(e) => {
                                setLoginUserName(e.target.value);
                            }}
                        />
                    </div>
                    <div className="input_container">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={(e) => {
                                setLoginPassword(e.target.value);
                            }}
                        />
                    </div>
                    <button
                        className="button_submit"
                        type="submit"
                        value="Submit"
                    >
                        Log In{' '}
                    </button>
                </form>
                {errorMessage && (
                    <div className="errorMessage">{errorMessage}</div>
                )}
            </div>
        </div>
    );
}

export default Login;
