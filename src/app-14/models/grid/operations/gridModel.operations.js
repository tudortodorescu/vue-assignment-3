
import Vue from 'vue'
import { cellBlueprint } from '../grid.model'
import { globalConfig } from '../../../config/global.config'
import { gridSvgService } from '../../../components/grid/services/gridSvg.service'

export const gridModelOperations = {
    removeColumnAtEnd() {
        for (let row = 1; row <= this.model.numRows; row++) {
            const position = this.getPosition(row, this.model.numCols)
            delete this.model.cells[position]
        }

        this.model.numCols--
        gridSvgService.calculateSvg()
    },
    removeRowAtEnd() {
        for (let col = 1; col <= this.model.numCols; col++) {
            const position = this.getPosition(this.model.numRows, col)
            delete this.model.cells[position]
        }

        this.model.numRows--
        gridSvgService.calculateSvg()
    },
    addColumnAtEnd() {
        this.model.numCols++

        for (let row = 1; row <= this.model.numRows; row++) {
            const position = this.getPosition(row, this.model.numCols)
            this.model.cells[position] = {...cellBlueprint}
        }

        gridSvgService.calculateSvg()
    },
    addRowAtEnd() {
        this.model.numRows++

        for (let col = 1; col <= this.model.numCols; col++) {
            const position = this.getPosition(this.model.numRows, col)
            this.model.cells[position] = {...cellBlueprint}
        }

        gridSvgService.calculateSvg()
    },
    spliceCols(position) {
        if (this.isElementsColEnd(position))
            this.addColumnAtEnd()

        const row = this.getRow(position)
        const col = this.getCol(position)

        for (let i = this.model.numCols; i > col; i--) {
            const nextPos = this.getPosition(row, i)
            const prevPos = this.getPosition(row, i - 1)

            this.model.cells[nextPos] = this.model.cells[prevPos]
            this.rearangeLinks(prevPos, nextPos)
        }
        
        this.model.cells[position] = {...cellBlueprint}
    },
    spliceRows(position) {
        if (this.isElementsRowEnd(position))
            this.addRowAtEnd()

        const row = this.getRow(position)
        const col = this.getCol(position)
        
        for (let i = this.model.numRows; i > row; i--) {
            const currPos = this.getPosition(i, col)
            const prevPos = this.getPosition(i - 1, col)

            this.model.cells[currPos] = this.model.cells[prevPos]
            this.rearangeLinks(prevPos, currPos)
        }

        this.model.cells[position] = {...cellBlueprint}
    },
    reduceGridSize(model) {
        let numRows = 0, 
            numCols = 0

        const rowLength = model.numRows - globalConfig.rowsFromTheEnd
        const colLength = model.numCols - globalConfig.colsFromTheEnd

        for (let row = 1; row <= rowLength; row++)
            for (let col = 1; col <= colLength; col++)
                if (model.steps[gridModel.getPosition(row, col)] && col > numCols)
                    numCols = col

        for (let col = 1; col <= colLength; col++)
            for (let row = 1; row <= rowLength; row++)
                if (model.steps[gridModel.getPosition(row, col)] && row > numRows)
                    numRows = row

        numRows += globalConfig.rowsFromTheEnd
        numCols += globalConfig.colsFromTheEnd

        numRows = (numRows < globalConfig.minGridRows) ? globalConfig.minGridRows : numRows
        numCols = (numCols < globalConfig.minGridColumns) ? globalConfig.minGridColumns : numCols

        return { numRows, numCols }
    }
}