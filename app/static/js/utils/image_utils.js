var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getOrigin } from '/static/js/common/common.js';
export class LoadedImage {
    constructor(image, source) {
        this.image = image;
        this.source = source;
    }
    deepCopy() {
        return new LoadedImage(this.image, this.source);
    }
}
const SERVER_PREFIX = 'server@';
export function loadImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = source.replace(SERVER_PREFIX, getOrigin());
        image.onload = (event) => {
            const loadedImage = new LoadedImage(event.currentTarget, source);
            resolve(loadedImage);
        };
        image.onerror = () => {
            reject(new Error('Failed to load image'));
        };
    });
}
/** Loads all the images requested in the URLs in the input array. */
export function loadImages(sources) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [];
        for (const source of sources) {
            promises.push(loadImage(source));
        }
        const res = yield Promise.all(promises);
        const imageMap = new Map();
        for (const loadedImage of res) {
            imageMap.set(loadedImage.source, loadedImage.image);
        }
        return imageMap;
    });
}
