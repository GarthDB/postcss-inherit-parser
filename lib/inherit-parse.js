import Input from 'postcss/lib/input';

import InheritParser from './inherit-parser';

/**
 *  Public: CSS parser for PostCSS that permits inherit syntax for postcss-inherit
 *
 *  * `css` - the raw css {String} to be parsed.
 *  * `opts` (optional) {Object} that can have a `propertyRegExp` property to change inherit syntax.
 *
 *  ## Example
 *
 *     var inherit   = require('postcss-inherit-parser');
 *     var css = '.b{cursor:pointer} .a{inherit: .b}';
 *     postcss(plugins).process(css, { parser: inherit }).then(function (result) {
 *        result.css
 *     });
 *
 *  Returns a postcss parser.
 */
export default function inheritParse(css, opts) {
  const input = new Input(css, opts);

  const parser = new InheritParser(input, opts);
  parser.tokenize();
  parser.loop();

  return parser.root;
}
