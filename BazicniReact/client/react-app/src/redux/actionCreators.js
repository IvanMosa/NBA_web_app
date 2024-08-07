import * as actions from './actionTypes'

export const logIn = (token) =>({
    type: actions.USER_LOGGED_IN,
    payload: {
        token
    }
})

export const logOut = () => {
    return {
        type: actions.USER_LOGGED_IN,
    }
}