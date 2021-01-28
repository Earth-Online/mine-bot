var core = require('./core')


const games = {};

module.exports = {

    getGame: function () {
        return games
    },
    gameInit: function gameInit(id, row, col, count) {
        games[id] = {
            row: row,
            col: col,
            count: count,
            map: null,
        };
        c = new core(col,row,count)
        games[id].map = c
        return games[id].map
    },
    haveGame: function (id){
      return  games[id] !== undefined;
    },
    gameClick: function gameClick(id, x, y) {

        // 游戏已经完成
        if (games[id] === undefined) {
            return null
        }

        let mineCore = games[id].map

        let cell = mineCore.cell(x, y)


        if(cell.flagged && !cell.revealed){
            return null
        }


        if (cell.revealed && cell.number !== 0) {
            let n =0
            let f = 0
            let eval = false
            for (const neighbour of mineCore.neighbourCells(cell)) {
                if (!neighbour.revealed)
                    n++
                if (neighbour.flagged)
                    f++;
            }
            if(n === cell.number){
                for (const neighbour of mineCore.neighbourCells(cell)) {
                    if (!neighbour.revealed)
                        neighbour.flagged = true
                    eval = true
                }

            }else if(f === cell.number){
                for (const neighbour of mineCore.neighbourCells(cell)) {
                    if (!neighbour.flagged)
                        mineCore.reveal(neighbour);
                    eval = true
                }
            }
            if(!eval){
                // 什么都没有发生
                return null
            }
            return mineCore
        }

        mineCore.reveal(cell)
        return mineCore

    },
    isGameWin: function isGameWin(id) {
        let lost = games[id].map.failed
        if (lost) {
            delete games[id]
            return -1
        }
        let win = games[id].map.checkAllOpen()
        if (win) {
            delete games[id]
            return 1
        }
        return 0
    }

};


