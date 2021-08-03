module.exports = {
    validate: function(width, height, count) {
        if (row > 12){
            return "行数最大12"
        }
        if (col > 8) {
            return "列数最大8"
        }
        if (count <= 0 || count >= row * col) {
            return "地雷数必须大于0和小于格子数量"
        }
        return null;
    },
    coreToKeyboard: function (core,boom) {
        const matrix = [];

        for (let i = 0; i < core.height; i += 1) {
            matrix.push([]);

            for (let j = 0; j < core.width; j += 1) {
                let cell = core.cell(j, i)
                let text = '\u2588'

                if (cell.revealed && !cell.knownMine) {
                    text = cell.number === 0 ? ' ' : cell.number;
                } else if (cell.flagged && !cell.revealed) {
                    text = '\u259a'
                }
                if (boom &&  cell.knownMine){
                    text = '*'
                }

                matrix[i].push({
                    text: text,
                    callback_data: JSON.stringify([j,i]),
                });
            }
        }

        return matrix;
    }
}



