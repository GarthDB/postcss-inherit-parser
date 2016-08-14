export default function inheritPropertySyntax(opts = {}) {
  const propertyRegExp = opts.propertyRegExp || /^(inherit|extend)s?$/i;
  return propertyRegExp;
}
