const users = [];

// add user, remove user, fetch user, get users in room, get rooms

const addUser = ({id, username}) => {

    // validate the data
    username = username.trim().toLowerCase()
    if(!username){
        return {
            error : 'Username is required'
        }
    }

    //store user
    const user = { id, username }
    users.push(user)
    return {user}
}

const getUsersExceptCurrent = (id) => {
    return users.filter(user => user.id!==id)
}

const removeUser = (id) => {
    const index = users.findIndex((user) => {
        return user.id === id
    })
    if(index!==-1) {
        return users.splice(index,1)[0];
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase();
    return users.filter((user) => user.room === room)
}

const getAllUsers = () => {
    return users;
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    getUsersExceptCurrent,
    getAllUsers
}