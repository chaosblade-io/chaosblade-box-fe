'use strict'
const { extname } = require('path')

const CSS_EXTNAMES = ['.css', '.less', '.sass', '.scss', '.stylus', '.styl']

module.exports = () => {
  return {
    visitor: {
      ImportDeclaration (path) {
        const { specifiers, source, source: { value } } = path.node
        if (specifiers.length && CSS_EXTNAMES.includes(extname(value))) {
          source.value = `${value}?css_modules`
        }
      }
    }
  }
}
