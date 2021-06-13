const socket = io();

const {username,password} = Qs.parse(location.search, { ignoreQueryPrefix : true });

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const invitesTemplate = document.querySelector('#invites-template').innerHTML

const gameTemplate = document.querySelector('#game-template').innerHTML

const winTemplate = document.querySelector('#win-template').innerHTML

socket.emit('storeUserSession' , {username}, (error) => {
    
});

socket.on('userRendering' , ({users}) => {
    const html = Mustache.render(sidebarTemplate, {
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

function inviteUserForGame(userId)
  {
    socket.emit('invite', {userId}, (error) => {

      });
  }

  socket.on('inviteRendering' , ({user}) => {
    if(!user){
        document.querySelector('#invitebar').innerHTML = ""
    } else{
    const html = Mustache.render(invitesTemplate, {
        user
    })
    document.querySelector('#invitebar').innerHTML += html;
}
});

socket.on('filterInviteBar', ({user}) => {
    if(document.getElementById(user.id))
        document.getElementById(user.id).innerHTML = "";
})


function accept(userId)
  {
    socket.emit('accept', {userId}, (error) => {

      });
  }

  socket.on('gameRendering', ({username , id}) => {
    const html = Mustache.render(gameTemplate, { username,id
    })
    document.querySelector('#gamebar').innerHTML += html;
  })

  function updateCell(rowId,columnId, userId){
        socket.emit("updateCell", {rowId, columnId, userId}, (error) => {})
  }

  socket.on('renderCell',({rowId, columnId, currentChar}) => {
    document.getElementById("tableData").rows[rowId].cells.item(columnId).innerHTML = currentChar;
  })

  socket.on('winMessage',({username}) => {
    document.querySelector('#gamebar').innerHTML = "";
    const html = Mustache.render(winTemplate, {
        username
    })
    document.querySelector('#gamebar').innerHTML = html;
  })

  socket.on('noChance', () => {
      alert("Not your turn!!");
  })
