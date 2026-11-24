// Emmet 2.4.11 ships these declarations but omits them from its exports map.
// Reuse the shipped API types until the package exposes its "types" condition.
declare module 'emmet' {
  const expand: typeof import('./node_modules/emmet/dist/index').default;
  export default expand;
  export const extract: typeof import('./node_modules/emmet/dist/index').extract;
  export const markupAbbreviation: typeof import('./node_modules/emmet/dist/index').markupAbbreviation;
}
