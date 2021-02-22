import { areLocationsEqual } from '/static/js/common/common.js';
import { INVALID_INDEX } from './model_handler.js';
import { NewTokenForm } from '/static/js/board_tools/board_form.js';
function tilesInDrag(fromData, toData) {
    const from = fromData.tile;
    const to = toData.tile;
    const selectedTiles = [];
    const colFrom = Math.min(from.col, to.col);
    const colTo = Math.max(from.col, to.col);
    const rowFrom = Math.min(from.row, to.row);
    const rowTo = Math.max(from.row, to.row);
    for (let i = colFrom; i <= colTo; i++) {
        for (let j = rowFrom; j <= rowTo; j++) {
            selectedTiles.push({ col: i, row: j });
        }
    }
    return selectedTiles;
}
class InteractionState {
    constructor(modelHandler) {
        this.modelHandler = modelHandler;
    }
    onDragEvent(fromPoint, toPoint, mouseButton) {
        if (mouseButton != 0 && mouseButton != 2) {
            return this;
        }
        const isLeftClick = mouseButton == 0;
        const from = this.clickDataForPoint(fromPoint);
        const to = this.clickDataForPoint(toPoint);
        const isSingleTileClick = areLocationsEqual(from.tile, to.tile);
        const newModel = this.modelHandler.copyModel();
        let result;
        if (isLeftClick) {
            if (isSingleTileClick) {
                result = this.onLeftClick(from, newModel);
            }
            else {
                result = this.onLeftDrag(from, to, newModel);
            }
        }
        else {
            if (isSingleTileClick) {
                result = this.onRightClick(from, newModel);
            }
            else {
                result = this.onRightDrag(from, to, newModel);
            }
        }
        this.modelHandler.update(result.model);
        return result.newState;
    }
    onContextMenuClickInternal(_action, _model) {
        throw new Error('Invalid state for onContextMenuClickInternal');
    }
    onContextMenuClick(action) {
        console.log('Handling context menu click');
        const newModel = this.modelHandler.copyModel();
        const result = this.onContextMenuClickInternal(action, newModel);
        this.modelHandler.update(result.model);
        return result.newState;
    }
    clickDataForPoint(absolutePoint) {
        return { point: absolutePoint, tile: this.tileForPoint(absolutePoint) };
    }
    tileForPoint(absolutePoint) {
        const rect = this.modelHandler.view.topCanvas.getBoundingClientRect();
        const relativePoint = { x: absolutePoint.x - rect.left, y: absolutePoint.y - rect.top };
        const tileSize = this.modelHandler.tileSize();
        const col = Math.floor(relativePoint.x / tileSize);
        const row = Math.floor(relativePoint.y / tileSize);
        return { col: col, row: row };
    }
}
class DefaultState extends InteractionState {
    constructor(modelHandler) {
        super(modelHandler);
    }
    onLeftDrag(fromData, toData, model) {
        return this.onRightDrag(fromData, toData, model);
    }
    onRightDrag(fromData, toData, model) {
        model.contextMenuState.isVisible = true;
        model.contextMenuState.selectedTiles = tilesInDrag(fromData, toData);
        model.contextMenuState.clickPoint = toData.point;
        return {
            model: model,
            newState: new ContextMenuOpenState(this.modelHandler)
        };
    }
    onLeftClick(clickData, model) {
        const tokenIndex = this.modelHandler.tokenIndexOfTile(clickData.tile);
        if (tokenIndex == INVALID_INDEX) {
            return this.onRightClick(clickData, model);
        }
        const mutableToken = model.tokens[tokenIndex].mutableCopy();
        mutableToken.isActive = true;
        model.tokens[tokenIndex] = mutableToken.freeze();
        return { model: model, newState: new PickedUpTokenState(this.modelHandler) };
    }
    onRightClick(clickData, model) {
        model.contextMenuState.isVisible = true;
        model.contextMenuState.selectedTiles = [clickData.tile];
        model.contextMenuState.clickPoint = clickData.point;
        return {
            model: model,
            newState: new ContextMenuOpenState(this.modelHandler)
        };
    }
}
class PickedUpTokenState extends InteractionState {
    constructor(modelHandler) {
        super(modelHandler);
    }
    onLeftDrag(fromData, _toData, model) {
        return this.onRightClick(fromData, model);
    }
    onRightDrag(fromData, _toData, model) {
        return this.onRightClick(fromData, model);
    }
    onLeftClick(clickData, model) {
        const isTileOpen = this.modelHandler.tokenIndexOfTile(clickData.tile) == INVALID_INDEX;
        if (!isTileOpen) {
            return this.onRightClick(clickData, model);
        }
        const activeTokenIndex = this.modelHandler.activeTokenIndex();
        if (activeTokenIndex == INVALID_INDEX) {
            throw new Error('No active token found in PickedUpTokenState');
        }
        const mutableToken = model.tokens[activeTokenIndex].mutableCopy();
        mutableToken.isActive = false;
        mutableToken.location = clickData.tile;
        model.tokens[activeTokenIndex] = mutableToken.freeze();
        return { model: model, newState: new DefaultState(this.modelHandler) };
    }
    onRightClick(_clickData, model) {
        const activeTokenIndex = this.modelHandler.activeTokenIndex();
        if (activeTokenIndex == INVALID_INDEX) {
            throw new Error('No active token found in PickedUpTokenState');
        }
        const mutableToken = model.tokens[activeTokenIndex].mutableCopy();
        mutableToken.isActive = false;
        model.tokens[activeTokenIndex] = mutableToken.freeze();
        return { model: model, newState: new DefaultState(this.modelHandler) };
    }
}
class ContextMenuOpenState extends InteractionState {
    constructor(modelHandler) {
        super(modelHandler);
    }
    onLeftDrag(fromData, _toData, model) {
        return this.onRightClick(fromData, model);
    }
    onRightDrag(fromData, _toData, model) {
        return this.onRightClick(fromData, model);
    }
    onLeftClick(clickData, model) {
        return this.onRightClick(clickData, model);
    }
    onRightClick(clickData, model) {
        model.contextMenuState.isVisible = false;
        model.contextMenuState.selectedTiles = [];
        model.contextMenuState.clickPoint = clickData.point;
        return { model: model, newState: new DefaultState(this.modelHandler) };
    }
    onContextMenuClickInternal(action, model) {
        // TODO: Refactor how the context menu interaction works.
        if (action == 1) {
            for (const tile of model.contextMenuState.selectedTiles) {
                model.fogOfWarState[tile.col][tile.row] = false;
            }
        }
        else if (action == 2) {
            for (const tile of model.contextMenuState.selectedTiles) {
                model.fogOfWarState[tile.col][tile.row] = true;
            }
        }
        else {
            NewTokenForm.create(model.contextMenuState.selectedTiles[0], this.modelHandler);
        }
        model.contextMenuState.isVisible = false;
        model.contextMenuState.selectedTiles = [];
        return { model: model, newState: new DefaultState(this.modelHandler) };
    }
}
export class InteractionStateMachine {
    constructor(modelHandler) {
        this.currentState = new DefaultState(modelHandler);
    }
    onDragEvent(fromPoint, toPoint, mouseButton) {
        const newState = this.currentState.onDragEvent(fromPoint, toPoint, mouseButton);
        this.currentState = newState;
    }
    onContextMenuClick(action) {
        const newState = this.currentState.onContextMenuClick(action);
        this.currentState = newState;
    }
}
