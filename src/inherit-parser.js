import Parser from 'postcss/lib/parser';
import tokenize from 'postcss/lib/tokenize';
import Declaration from 'postcss/lib/declaration';
import inheritPropertySyntax from './inherit-property-syntax';

/**
 *  InheritParser Class extends default PostCSS Parser
 */
export default class InheritParser extends Parser {
  /**
   *  Public: intiates InheritParser Class and loads options
   *
   *  * `input` css source {String}
   *  * `opts` (optional) {Object} the `propertyRegExp` property will change inherit syntax.
   *
   *  ## Example
   *
   *     export default function inheritParse(css, opts) {
   *       const input = new Input(css, opts);
   *       const parser = new InheritParser(input, opts);
   *       parser.tokenize();
   *       parser.loop();
   *       return parser.root;
   *     }
   */
  constructor(input, opts = {}) {
    super(input);
    this.propertyRegExp = inheritPropertySyntax(opts);
  }
  /**
   *  Public: uses default postcss tokenize method.
   *
   *  ## Example
   *
   *  Used as part of the postcss parser
   *
   *     parser.tokenize();
   */
  tokenize() {
    this.tokens = tokenize(this.input);
  }
  /**
   *  Public: overrides default parser `decl` method; parses tokenized css declarations
   *
   *  * `tokens` {Array} of tokens from `tokenize` method.
   *
   *  ## Example
   *
   *  Really only used by other methods in the parser.
   *
   *    this.decl(this.tokens.slice(start, this.pos + 1));
   *
   *  Returns {Declaration}
   */
  decl(tokens) {
    const node = new Declaration();
    this.init(node);

    const last = tokens[tokens.length - 1];
    if (last[0] === ';') {
      this.semicolon = true;
      tokens.pop();
    }
    if (last[4]) {
      node.source.end = { line: last[4], column: last[5] };
    } else {
      node.source.end = { line: last[2], column: last[3] };
    }

    while (tokens[0][0] !== 'word') {
      node.raws.before += tokens.shift()[1];
    }
    node.source.start = { line: tokens[0][2], column: tokens[0][3] };

    node.prop = '';
    while (tokens.length) {
      const type = tokens[0][0];
      if (type === ':' || type === 'space' || type === 'comment') {
        break;
      }
      node.prop += tokens.shift()[1];
    }

    node.raws.between = '';

    let token;
    while (tokens.length) {
      token = tokens.shift();

      if (token[0] === ':') {
        node.raws.between += token[1];
        break;
      } else {
        node.raws.between += token[1];
      }
    }

    if (node.prop[0] === '_' || node.prop[0] === '*') {
      node.raws.before += node.prop[0];
      node.prop = node.prop.slice(1);
    }
    node.raws.between += this.spacesFromStart(tokens);
    this.precheckMissedSemicolon(tokens);

    for (let i = tokens.length - 1; i > 0; i--) {
      token = tokens[i];
      if (token[1] === '!important') {
        node.important = true;
        let string = this.stringFrom(tokens, i);
        string = this.spacesFromEnd(tokens) + string;
        if (string !== ' !important') node.raws.important = string;
        break;
      } else if (token[1] === 'important') {
        const cache = tokens.slice(0);
        let str = '';
        for (let j = i; j > 0; j--) {
          const type = cache[j][0];
          if (str.trim().indexOf('!') === 0 && type !== 'space') {
            break;
          }
          str = cache.pop()[1] + str;
        }
        if (str.trim().indexOf('!') === 0) {
          node.important = true;
          node.raws.important = str;
          // eslint-disable-next-line no-param-reassign
          tokens = cache;
        }
      }

      if (token[0] !== 'space' && token[0] !== 'comment') {
        break;
      }
    }

    this.raw(node, 'value', tokens);

    if (node.value.indexOf(':') !== -1) this.checkMissedSemicolon(tokens, node.prop);
  }
  /**
   *  Public: overrides default parser `checkMissedSemicolon` method.
   *  Checks for 2 colons without a semi colon inbetween.
   *  Ignored if property is the inherit keyword.
   *
   *  * `tokens` {Array} of tokens from `tokenize` method.
   *  * `prop` {String} of css property
   *
   *  ## Example
   *
   *  Meant to only be used by other parser methods.
   *
   *     if (node.value.indexOf(':') !== -1) this.checkMissedSemicolon(tokens, node.prop);
   *
   *  Throws error if it detects missed semicolon
   */
  checkMissedSemicolon(tokens, prop) {
    if (this.propertyRegExp.test(prop)) return;
    const colon = this.colon(tokens);
    if (colon === false) return;

    let founded = 0;
    let token;
    for (let j = colon - 1; j >= 0; j--) {
      token = tokens[j];
      if (token[0] !== 'space') {
        founded += 1;
        if (founded === 2) break;
      }
    }
    throw this.input.error('Missed semicolon', token[2], token[3]);
  }
}
