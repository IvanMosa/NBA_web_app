import * as actions from './actionTypes';
import axios from 'axios';

function reducer(store = [], action) {
    const logout = async () => {
        await axios.post('http://localhost:4000/logout');
    };
    console.log('reducer');
    switch (action.type) {
        case actions.USER_LOGGED_IN:
            console.log('reducer - log in');
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('roles', action.payload.roles);
            return action.payload.token;
        case actions.USER_LOGGED_OUT:
            logout();
            console.log('reducer - log out');
            localStorage.removeItem('token');
            return [];
        default:
            return store;
    }
}

export default reducer;
