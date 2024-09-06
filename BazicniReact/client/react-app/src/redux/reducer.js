import * as actions from './actionTypes';

function reducer(store = [], action) {
    console.log('reducer');
    switch (action.type) {
        case actions.USER_LOGGED_IN:
            console.log('reducer - log in');
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('refreshToken', action.payload.refreshToken);
            localStorage.setItem('roles', action.payload.roles);
            return action.payload.token;
        case actions.USER_LOGGED_OUT:
            console.log('reducer - log out');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('roles');
            return [];
        default:
            return store;
    }
}

export default reducer;
