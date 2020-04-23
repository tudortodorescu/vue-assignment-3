import Vue from 'vue'
import { globalConfig } from '../../../config/global.config'
import { gridModel } from "../grid.model"
import { LinkDrawHelper } from '../helpers/linkDraw.helper'
import linkEEMapHelper from '../helpers/linkEEMap.helper'
import { linkPathMapHelper } from '../helpers/linkPathMap.helper'
import { LinkKeyIterator } from '../iterators/LinkKeyIterator'
import { gridLinksDrawService } from './gridLinksDraw.service'

export const gridLinksService = {
    svgPaths: {},
    colors: [],
    colorIds: [],

    buildLinks() {
        this.svgPaths = {}
        this.colors = []
        this.colorIds = []

        linkEEMapHelper.generateEEmap()
        linkPathMapHelper.resetPathMap()

        const links = gridModel.model.links
        const lki = new LinkKeyIterator(links)

        while(lki.continue)
            this.generateSvgPath(lki.linkKey)
    },

    generateSvgPath(linkKey = '', isDrag = false) {
        Vue.set(this.svgPaths, linkKey, [])
        const ldh = new LinkDrawHelper(linkKey)

        linkEEMapHelper.restoreEEMapState()
        if (isDrag) linkEEMapHelper.saveEEMapState(ldh)
        
        const pathArrow = gridLinksDrawService.createPathAndArrow(ldh)
        const color = this.getPathColor(ldh, isDrag)

        this.setPaths(pathArrow[0], pathArrow[1], linkKey, color)
    },
    setPaths(path, arrow, linkKey, color) {
        path.color = color
        path.linkKey = linkKey

        arrow.color = color
        arrow.linkKey = linkKey

        this.svgPaths[linkKey].push(path)
        this.svgPaths[linkKey].push(arrow)
    },
    getPathColor(ldh, isDrag) {
        if (this.colors.length === 0)
            this.colors = [...globalConfig.colorArray]
        
        if (ldh.idLink && !this.colorIds[ldh.idLink] && !isDrag)
            this.colorIds[ldh.idLink] = this.colors.pop()

        return isDrag ? '#e9e9e9' : this.colorIds[ldh.idLink]
    },
    rearangeLinks(oldPosition, newPosition) {
        const links = gridModel.model.links
        const lki = new LinkKeyIterator(links)

        while (lki.continue) {
            const link1 = LinkDrawHelper.getLink1(lki.linkKey)
            const link2 = LinkDrawHelper.getLink2(lki.linkKey)

            if (link1 === oldPosition)
                gridModel.model.links[lki.i - 1] = LinkDrawHelper.genLinkKey(newPosition, link2)

            else if (link2 === oldPosition)
                gridModel.model.links[lki.i - 1] = LinkDrawHelper.genLinkKey(link1, newPosition)
        }
    },
    hasNoLinks(position) {
        if (!position) return true

        const links = gridModel.model.links
        const lki = new LinkKeyIterator(links)

        while (lki.continue) {
            if (lki.linkKey.includes(position))
                return false
        }

        return true
    },
    deleteAllLinks(position) {
        if (!position) return
        
        const links = gridModel.model.links
        const lki = new LinkKeyIterator(links)

        while (lki.continue) {
            if (lki.linkKey.includes(position)) {
                const index = gridModel.model.links.indexOf(lki.linkKey)
                delete gridModel.model.links[index]
            }
        }
    }
}