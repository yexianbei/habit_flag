/*
 * @description: 
 * @LastEditTime: 2024-11-29 11:28:33
 */
module.exports = {
  include: ['src/**/*.vue', 'src/**/*.ts', 'src/**/*.tsx'],
  exclude: ['node_modules', 'dist'],
  extensions: ['.vue', '.ts', '.tsx'],
  compilerOptions: {
    sourceMap: true,
    noEmit: true
  }
} 