const gamers = new Map();

const setGamer = (userId, character, playingWith, lastPlayed) => {
    gamers.set(userId,{char:character,playingWith:playingWith,lastPlayed:lastPlayed});
}

const getGamer = (id) => {
    return gamers.get(id)
}

const updateCellData = (rowId,ColumnId, id)=>{
    if(!getGamer(id).cellData){
        getGamer(id).cellData = [];
    } 
    getGamer(id).cellData.push(rowId +"_" + ColumnId);
}

const updateLastPlayed = (currentUser, playingWith, lastPlayed) => {
    getGamer(currentUser).lastPlayed = lastPlayed;
    getGamer(playingWith).lastPlayed = lastPlayed;
}


module.exports = {
    setGamer,
    getGamer,
    updateCellData,
    updateLastPlayed
}