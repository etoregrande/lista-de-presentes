declare module 'psl' {
  // psl ships these types but omits them from its package exports.
  const psl: typeof import('../../node_modules/psl/types/index')
  export default psl
}
