const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const express = require('express');
const usersUtil = require('./utils/users')
const gamersUtil = require('./utils/gamers')
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3002;

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {

    socket.on('storeUserSession', ({username}, acknowledgement) => { 
        const user = usersUtil.addUser({id:socket.id,username})
        socket.emit('userRendering', {
            users : usersUtil.getUsersExceptCurrent(socket.id)
        });
        const users = usersUtil.getAllUsers();
        users.forEach( (element) => {
            socket.broadcast.to(element.id).emit('userRendering', {
                users : usersUtil.getUsersExceptCurrent(element.id)
            });
        })
    });

    socket.on('invite', ({userId}, acknowledgement) => { 
        socket.broadcast.to(userId).emit('inviteRendering', {
            user: usersUtil.getUser(socket.id)
        });
    })

    socket.on('accept', ({userId}, acknowledgement) => { 
        socket.broadcast.to(userId).emit('gameRendering', {
            username:usersUtil.getUser(socket.id).username, id:socket.id
        });
        socket.emit('gameRendering', {
            username:usersUtil.getUser(userId).username, id:userId
        });
    })

    socket.on("updateCell", ({rowId, columnId, userId}, acknowledgement) => {
        let socketUserData = gamersUtil.getGamer(socket.id);
        let bool = true;
        if(!socketUserData){
            gamersUtil.setGamer(socket.id, "O", userId, socket.id);
            gamersUtil.setGamer(userId, "X", socket.id, socket.id);
        } else{
            if(socketUserData.lastPlayed == socket.id){
                bool = false;
                socket.emit('noChance',{});
            } else{
                bool=true;
                gamersUtil.updateLastPlayed(socket.id, userId, socket.id);
            }
        }
        //don't allow continuous chances to same person
        
        if(bool){
            gamersUtil.updateCellData(rowId,columnId,socket.id);
            let gamer = gamersUtil.getGamer(socket.id);
            socket.broadcast.to(userId).emit('renderCell', {rowId,columnId,currentChar:gamer.char});
            socket.emit('renderCell', {rowId,columnId,currentChar:gamer.char}); 
            //logic of winning
            
            if(gamer.cellData.length>2){
                //checking for row win
                for(let i=0; i<=2; i++){
                    if(!gamer.cellData.includes(rowId + "_" + i)){
                        bool = false;
                        break;
                    }
                }
                //checking for col win
                if(!bool){
                    bool=true;
                    for(let i=0; i<=2; i++){
                        if(!gamer.cellData.includes(i + "_" + columnId)){
                            bool = false;
                            break;
                        }
                    }
                }
                //checking for diagonal win
                if(!bool){
                    bool=true;
                    if(rowId==columnId && rowId!=1){
                        for(let i=0; i<=2; i++){
                            if(!gamer.cellData.includes(i + "_" + i)){
                                bool = false;
                                break;
                            }
                        }
                    } else{
                        if(!bool && ((rowId==1 && columnId==1) || (rowId!=1 && columnId!=1))){
                            bool=true;
                            for(let i=0, j=2; i<=2, j>=0; i++,j--){
                                if(!gamer.cellData.includes(i + "_" + j)){
                                    bool = false;
                                    break;
                                }
                            }
                        }
                    }
                }
                if (bool){
                    let user = usersUtil.getUser(socket.id);
                    socket.emit('winMessage',{username:user.username});
                    socket.broadcast.to(userId).emit('winMessage',{username:user.username});
                }
            }
        }
    })

    socket.on('disconnect', () => {
        const user = usersUtil.removeUser(socket.id)
        const users = usersUtil.getAllUsers();
        users.forEach( (element) => {
            socket.broadcast.to(element.id).emit('userRendering', {
                users : usersUtil.getUsersExceptCurrent(element.id)
            });
        })
        io.emit('filterInviteBar', {user});
    })

});

server.listen(port);

module.exports = io;