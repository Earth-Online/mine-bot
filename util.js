module.exports = {
    validate: function(width, height, count) {
        if (width > 10 || height > 10) {
            return "行数和列数最大10"
        }
        if (count <= 0 || count >= width * height) {
            return "地雷数必须大于0和小于格子数量"
        }
        return null;
    },
    coreToKeyboard: function (core,boom) {
        const matrix = [];

        for (let i = 0; i < core.width; i += 1) {
            matrix.push([]);

            for (let j = 0; j < core.height; j += 1) {
                let cell = core.cells[i][j]
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



