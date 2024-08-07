import * as actions from './actionTypes'

function reducer(store=[], action) {
    console.log("reducer")
    switch(action.type) {
        case actions.USER_LOGGED_IN:
            console.log("reducer - log in")
            localStorage.setItem("token",action.payload.token)
            return action.payload.token;
        case actions.USER_LOGGED_OUT:
            console.log("reducer - log out")
            localStorage.removeItem("token")
            return [];
        default:
            return store
    }
}

export default reducer