export class Maybe {
    constructor(item) {
        this.item = item;
    }
    static of(item) {
        return new Maybe(item);
    }
    static absent() {
        return new Maybe(null);
    }
    get() {
        return this.item;
    }
    present() {
        return this.item != null;
    }
}
