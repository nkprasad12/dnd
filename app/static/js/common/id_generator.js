/** Generates a (hopefully) unique (enough) id. */
export function getId() {
    const dateComponent = String(Date.now());
    const randomComponent = String(Math.floor(Math.random() * 10000));
    return randomComponent + '-' + dateComponent;
}
