var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RemoteBoardModel } from '/static/js/game_board/model/remote_board_model.js';
import { areLocationsEqual } from '/static/js/common/common.js';
export const INVALID_INDEX = -1;
export class ModelHandler {
    constructor(view, model, remoteBoard) {
        this.view = view;
        this.model = model;
        this.remoteBoard = remoteBoard;
        this.view.bind(this.model);
    }
    update(newModel) {
        this.model = newModel;
        this.view.bind(this.copyModel());
        this.remoteBoard.onLocalUpdate(RemoteBoardModel.create(this.model));
    }
    applyRemoteDiff(diff) {
        return __awaiter(this, void 0, void 0, function* () {
            const newModel = yield this.model.mergedFrom(diff);
            this.model = newModel;
            console.log('New merged model from remote diff');
            console.log(this.model);
            this.view.bind(this.copyModel());
        });
    }
    copyModel() {
        return this.model.deepCopy();
    }
    tokens() {
        return this.model.tokens;
    }
    tileSize() {
        return this.model.tileSize;
    }
    activeTokenIndex() {
        const tokens = this.tokens();
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (token.isActive) {
                return i;
            }
        }
        return INVALID_INDEX;
    }
    tokenIndexOfTile(tile) {
        const tokens = this.tokens();
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (areLocationsEqual(token.location, tile)) {
                return i;
            }
        }
        return INVALID_INDEX;
    }
}
