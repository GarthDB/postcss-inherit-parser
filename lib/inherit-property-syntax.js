/**
 *  Public: returns a regex to check inherit property
 *
 *  * `opts` {Object} - a `propertyRegExp` property will change the regex for postcss-inherit syntax
 *
 *  ## Example
 *
 *     const propertyRegExp = inheritPropertySyntax({propertyRegExp: /^extends?$/});
 *     console.log(propertyRegExp.test(prop)) // boolean
 *
 *  {RegExp}
 */
export default function inheritPropertySyntax(opts = {}) {
  const propertyRegExp = opts.propertyRegExp || /^(inherit|extend)s?$/i;
  return propertyRegExp;
}
