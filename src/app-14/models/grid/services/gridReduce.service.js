import { globalConfig } from "../../../config/global.config"
import { gridModel } from "../grid.model"
import { gridAdjustService } from "./gridAdjust.service"
import { gridSvgService } from "../../../components/grid/services/gridSvg.service"

export const gridReduceService = {
    reduceGrid() {
        this.reduceGridBottom()
        this.reduceGridRight()
    },
    reduceGridBottom() {
        const gc = globalConfig
        const gm = gridModel.model

        let numRows = -1

        for (let row = gc.minGridRows; row <= gm.numRows; row++) {
            for (let col = 1; col <= gm.numCols; col++) {
                const position = gridModel.getPosition(row, col)

                if (gm.cells[position] && gm.cells[position].is && row > numRows)
                    numRows = row
            }
        }

        if (numRows === -1 && gm.numRows >= gc.minGridRows) {
            for (let i = gm.numRows; i > gc.minGridRows; i--)
                gridAdjustService.removeRowAtEnd()

            gm.numRows = gc.minGridRows
            return
        }

        for (let i = numRows + 1; i <= gm.numRows - gc.rowsFromTheEnd; i++)
            gridAdjustService.removeRowAtEnd()

        gm.numRows = numRows

        for (let i = 1; i <= gc.rowsFromTheEnd; i++)
            gridAdjustService.addRowAtEnd()

        gridSvgService.calculateSvg(true)
    },
    reduceGridRight() {
        const gc = globalConfig
        const gm = gridModel.model

        let numCols = -1

        for (let col = gc.minGridCols; col <= gm.numCols; col++) {
            for (let row = 1; row <= gm.numRows; row++) {
                const position = gridModel.getPosition(row, col)

                if (gm.cells[position] && gm.cells[position].is && col > numCols)
                    numCols = col
            }
        }

        if (numCols === -1 && gm.numCols >= gc.minGridCols) {
            for (let i = gm.numCols; i > gc.minGridCols; i--)
                gridAdjustService.removeColAtEnd()

            gm.numCols = gc.minGridCols
            return
        }

        for (let i = numCols + 1; i <= gm.numCols - gc.colsFromTheEnd; i++)
            gridAdjustService.removeColAtEnd()

        gm.numCols = numCols

        for (let i = 1; i <= gc.colsFromTheEnd; i++)
            gridAdjustService.addColAtEnd()

        gridSvgService.calculateSvg(true)
    }
}