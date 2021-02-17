/** Generates a (hopefully) unique (enough) id. */
export function getId(): string {
  let dateComponent = String(Date.now());
  let randomComponent = String(Math.floor(Math.random() * 10000));
  return dateComponent + randomComponent;
}
