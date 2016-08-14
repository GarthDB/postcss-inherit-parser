import Input from 'postcss/lib/input';

import InheritParser from './inherit-parser';

export default function inheritParse(css, opts) {
  const input = new Input(css, opts);

  const parser = new InheritParser(input, opts);
  parser.tokenize();
  parser.loop();

  return parser.root;
}
