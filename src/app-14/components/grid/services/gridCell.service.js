import { gridModel } from "../../../models/grid/grid.model"
import { gridAdjustService } from "../../../models/grid/services/gridAdjust.service"
import { gridIOservice } from "../../../models/grid/services/gridIO.service"
import { gridMouseDroppointsService } from "../../../models/grid/services/gridMouseDroppoints.service"
import { Utils } from "../../../utils/utils"
import { toolboxDragService } from "../../toolbox/services/toolboxDrag.service"

export const droppointsDisplayBlueprint = {
    showUp: false,
    showRight: false,
    showDown: false,
    showLeft: false,
    showMiddle: false
}

export const gridCellService = {
    activeUid: null,
    activeGridcell: null,

    isDifferentCell(gridcell) {
        return gridcell.__vue__._uid !== this.activeUid
    },
    previousCellOperations() {
        if (!this.activeGridcell) return
        
        this.hideDroppoints()
        this.activeGridcell.classList.remove('allowed-drop')
        this.activeGridcell.classList.remove('not-allowed-drop')
    },
    hideDroppoints(gridcell) {
        gridcell = gridcell || this.activeGridcell
        
        if (gridcell && gridcell.__vue__)
            gridcell.__vue__.$data.droppointsDisplay = {...droppointsDisplayBlueprint}
    },
    savePreviousCell(gridcell) {
        this.activeGridcell = gridcell
        this.activeUid = gridcell.__vue__._uid
    },
    resetCell(position) {
        gridModel.model.totalSteps--
        gridModel.model.cells[position].is = false
    },
    removePreviousCell() {
        if (!toolboxDragService.dragPosition) return
            
        gridCellService.resetCell(toolboxDragService.dragPosition);
        return toolboxDragService.dragPosition
    },
    setCellActive(newPosition, oldPosition) {
        const cellObj = { is: 1, type: toolboxDragService.dragType }

        const oldCell = gridModel.model.cells[oldPosition]
        if (oldCell && oldCell.id) {
            cellObj.id = oldCell.id
            oldCell.id = 0
        }

        gridIOservice.setCell(newPosition, cellObj)
    },
    setMiddleDroppointActive(gridcell) {
        gridcell.__vue__.$data.droppointsDisplay = {...droppointsDisplayBlueprint, showMiddle: true}
    },
    getDroppointDirection(event, gridcell, position) {
        const droppointsDisplay = Utils.deepclone(droppointsDisplayBlueprint)
        let droppointDirection = ''

        if (this.isDroppointDirectionDown(event, gridcell, position)) {
            droppointsDisplay.showDown = true
            droppointDirection = 'down'
        }
        if (this.isDroppointDirectionUp(event, gridcell, position)) {
            droppointsDisplay.showUp = true
            droppointDirection = 'up'
        }
        if (this.isDroppointDirectionRight(event, gridcell, position)) {
            droppointsDisplay.showRight = true
            droppointDirection = 'right'
        }
        if (this.isDroppointDirectionLeft(event, gridcell, position)) {
            droppointsDisplay.showLeft = true
            droppointDirection = 'left'
        }
      
        if (droppointDirection)
            gridcell.__vue__.$data.droppointsDisplay = droppointsDisplay

        return droppointDirection
    },
    isDroppointDirectionDown(event, gridcell, position) {
        const isMouseOnBottom = gridMouseDroppointsService.isMouseOnBottomOutside(event, gridcell)
        const isCellBellow = gridMouseDroppointsService.hasElementBellow(position)

        return isMouseOnBottom && isCellBellow
    },
    isDroppointDirectionUp(event, gridcell, position) {
        const isCellAbove = gridMouseDroppointsService.hasElementAbove(position)
        const isMouseOnTop = gridMouseDroppointsService.isMouseOnTopOutside(event, gridcell)

        return isCellAbove && isMouseOnTop
    },
    isDroppointDirectionRight(event, gridcell, position) {
        const isCellRight = gridMouseDroppointsService.hasElementRight(position)
        const isMouseOnRight = gridMouseDroppointsService.isMouseOnRightOutside(event, gridcell)
        
        return isCellRight && isMouseOnRight
    },
    isDroppointDirectionLeft(event, gridcell, position) {
        const isCellLeft = gridMouseDroppointsService.hasElementLeft(position)
        const isMouseOnLeft = gridMouseDroppointsService.isMouseOnLeftOutside(event, gridcell)

        return isCellLeft && isMouseOnLeft
    },
    moveCellsByDroppointDirection(direction, position) {
        let droppointPosition

        if (direction === 'down') {
            droppointPosition = gridModel.getPositionDiff(position, 1, 0)
            gridAdjustService.spliceRows(droppointPosition)
        }

        else if (direction === 'up') {
            droppointPosition = gridModel.getPositionDiff(position, 0, 0)
            gridAdjustService.spliceRows(droppointPosition)
        }

        if (direction === 'right') {
            droppointPosition = gridModel.getPositionDiff(position, 0, 1)
            gridAdjustService.spliceCols(droppointPosition)
        }

        else if (direction === 'left') {
            droppointPosition = gridModel.getPositionDiff(position, 0, 0)
            gridAdjustService.spliceCols(droppointPosition)
        }

        return droppointPosition
    }
}