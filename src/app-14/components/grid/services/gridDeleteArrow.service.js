import { globalConfig as gc } from "../../../config/global.config"
import { gridModel } from "../../../models/grid/grid.model"
import { gridHistoryService } from "../../../models/grid/services/gridHistory.service"
import { gridLinksBuilderService } from "../../../models/grid/services/grid-links/gridLinksBuilder.service"
import { toolboxDragService } from "../../toolbox/services/toolboxDrag.service"
import { gridArrowConnectorService } from "./gridArrowConnector.service"
import { gridPanService } from "./gridPan.service"
import { DimensionsConfigEnum } from "../../../config/dimensions/DimensionsConfigEnum"

export const gridDeleteArrowService = {
    svgEl: null,
    gridlayoutEl: null,
    selectorId: '',
    arrowDeleteEl: null,
    waitMousemove: false,
    waitMousemoveTimeout: null,
    linkKey: '',
    i: 0,
    top: 0,
    left: 0,
    
    findSvgPath(event) {
        if (!this.selectorId)
            throw new Error('Please specificy a selectorId for gridDeleteArrow service before initializing')

        if (!this.arrowDeleteEl)
            this.arrowDeleteEl = document.querySelector(`#${this.selectorId}`)

        if (this.waitMousemove || gridArrowConnectorService.startedDrag 
            || toolboxDragService.startedDrag || gridPanService.startedPan) return

        if (event.target.classList.contains('gridcell')) {
            const el = this.getSvgPath(event)
            el ? this.build(el, event) : this.hideArrowDelete()
        }

        const vm = this
        this.waitMousemove = true;
        this.waitMousemoveTimeout = setTimeout(function () { vm.waitMousemove = false; }, 0);
    },
    getSvgPath(event) {
        this.svgEl.style.zIndex = 2
        this.gridlayoutEl.style.zIndex = 1

        const html = document.querySelector('html')
        const x = event.pageX - html.scrollLeft
        const y = event.pageY - html.scrollTop

        let el
        for (let i = -10; i <= 10; i++) {
            el = document.elementFromPoint(x + i, y + i);
            if (el && el.constructor === SVGPathElement) {
                this.i = i
                break;
            }
        }

        this.svgEl.style.zIndex = 1
        this.gridlayoutEl.style.zIndex = 2

        if (el && el.constructor === SVGPathElement 
                && !el.getAttribute('d').includes('Z'))
            return el

        return null
    },
    build(el, event) {
        let adjust
        if (gc.dimensionType === DimensionsConfigEnum.SQUARE) {
            adjust = Math.floor(this.mathMedium / 4)
        }
        else if (gc.dimensionType === DimensionsConfigEnum.RECTANGULAR) {
            adjust = Math.floor(this.mathMedium / 5.5)
        }

        Object.assign(this.arrowDeleteEl.style, {
            display: `block`,
            fontSize: `${adjust}px`,
            width: `${adjust}px`,
            height: `${adjust}px`,
            borderRadius: `${adjust}px`
        })

        this.arrowDeleteEl.querySelector('i').style.top = `-${Math.round(adjust / 3.3)}px`

        const html = document.querySelector('html')
        this.setTopLeft(el, event, html, adjust)

        this.linkKey = el.getAttribute('linkKey')

        Object.assign(this.arrowDeleteEl.style, {
            top: `${this.top}px`,
            left: `${this.left}px`
        })
    },
    setTopLeft(el, event, html, adjust) {
        if (el.getAttribute('linkKey') !== this.linkKey || (!this.top && !this.left)) {
            this.top = event.pageY - html.scrollTop - adjust / 2
            this.left = event.pageX - html.scrollLeft - adjust / 2

            if (Math.sign(this.i) === -1) {
                this.top += this.i
                this.left += this.i + 1.5
            }
            else if (Math.sign(this.i) === 1) {
                this.top += this.i + 1.5
                this.left += this.i + 3
            }
        }
    },
    deleteLink() {
        gridModel.deleteLink(this.linkKey)
        
        gridLinksBuilderService.buildLinks()
        gridHistoryService.saveState()
        
        this.linkKey = ''
        this.waitMousemove = false
        this.hideArrowDelete()
    },
    hideArrowDelete() {
        if (!this.arrowDeleteEl)
            this.arrowDeleteEl = document.querySelector('#arrow-delete')

        this.arrowDeleteEl.style.display = 'none'    
    },
    resetLeftTop() {
        this.left = 0
        this.top = 0
    },

    get mathMedium() {
        return (gc.gridCellElementWidth + gc.gridCellElementHeight) / 2
    }
}