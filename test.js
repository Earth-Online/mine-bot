
const test = require('ava');
const util = require('./util');
const game = require('./game');

test('validate', t => {

    msg = util.validate(11,11,20)
    t.not(msg,null)
    msg = util.validate(5,5,50)
    t.not(msg,null)
    msg = util.validate(8,8,20)
    t.is(msg,null)

});

test("gameInit",t =>{
        c = game.gameInit(1,8,8,25)
        t.assert(game.getGame()[1])
        matrix = util.coreToKeyboard(c)
        for (let i = 0; i < matrix.length; i++) {
            let data = matrix[i]
            for (let j = 0; j < data.length; j++) {
                t.is(data[j].text,'\u2588')
            }
        }
        c = game.gameClick(1,0,0)
        matrix = util.coreToKeyboard(c)

    }
);

