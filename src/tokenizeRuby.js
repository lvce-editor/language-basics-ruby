/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
  InsideSingleQuoteString: 3,
  InsideBackTickQuoteString: 4,
  InsideEof: 5,
}

export const StateMap = {
  [State.TopLevelContent]: 'TopLevelContent',
}

/**
 * @enum number
 */
export const TokenType = {
  None: 1,
  Whitespace: 2,
  PunctuationString: 3,
  String: 4,
  Keyword: 5,
  Numeric: 6,
  Punctuation: 7,
  VariableName: 8,
  Comment: 9,
  KeywordControl: 10,
  LanguageConstant: 11,
  KeywordReturn: 12,
  Regex: 13,
  KeywordImport: 14,
}

export const TokenMap = {
  [TokenType.None]: 'None',
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.PunctuationString]: 'PunctuationString',
  [TokenType.String]: 'String',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.Numeric]: 'Numeric',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.Comment]: 'Comment',
  [TokenType.KeywordControl]: 'KeywordControl',
  [TokenType.LanguageConstant]: 'LanguageConstant',
  [TokenType.KeywordReturn]: 'KeywordReturn',
  [TokenType.Regex]: 'Regex',
  [TokenType.KeywordImport]: 'KeywordImport',
}

const RE_SELECTOR = /^[\.a-zA-Z\d\-\:>]+/
const RE_WHITESPACE = /^ +/
const RE_CURLY_OPEN = /^\{/
const RE_CURLY_CLOSE = /^\}/
const RE_PROPERTY_NAME = /^[a-zA-Z\-]+\b/
const RE_COLON = /^:/
const RE_PROPERTY_VALUE = /^[^;\}]+/
const RE_SEMICOLON = /^;/
const RE_COMMA = /^,/
const RE_ANYTHING = /^.+/s
const RE_ANYTHING_UNTIL_CLOSE_BRACE = /^[^\}]+/
const RE_QUOTE_DOUBLE = /^"/
const RE_QUOTE_SINGLE = /^'/
const RE_QUOTE_BACKTICK = /^`/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"\\]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^'\\]+/
const RE_STRING_BACKTICK_QUOTE_CONTENT = /^[^`]+/
const RE_KEYWORD =
  /^(?:alias|and|begin|break|case|class|def|defined\?|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|require|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield)\b/
const RE_VARIABLE_NAME = /^[a-zA-Z\_\$]+/
const RE_PUNCTUATION = /^[:,;\{\}\[\]\.=\(\)<>\-\|\&\+\?\!\%\*\/\@]/
const RE_NUMERIC = /^\d+/
const RE_LINE_COMMENT = /^#.*/s
const RE_EOF_START = /^<<\-?\s*([\w\!]+)/
const RE_EOF_CONTENT = /.*/s
// const RE_REGEX = /^\/.+/
const RE_REGEX = /^\/.*\//
const RE_STRING_ESCAPE = /^\\./

export const initialLineState = {
  state: State.TopLevelContent,
  tokens: [],
  stringEnd: '',
}

export const isEqualLineState = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

export const hasArrayReturn = true

/**
 * @param {string} line
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  let stringEnd = lineState.stringEnd
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_KEYWORD))) {
          switch (next[0]) {
            case 'break':
            case 'case':
            case 'do':
            case 'elsif':
            case 'else':
            case 'for':
            case 'if':
            case 'in':
            case 'then':
            case 'while':
            case 'end':
              token = TokenType.KeywordControl
              break
            case 'true':
            case 'false':
            case 'nil':
              token = TokenType.LanguageConstant
              break
            case 'return':
              token = TokenType.KeywordReturn
              break
            case 'require':
              token = TokenType.KeywordImport
              break
            default:
              token = TokenType.Keyword
              break
          }
          state = State.TopLevelContent
        } else if ((next = part.match(RE_EOF_START))) {
          token = TokenType.Punctuation
          state = State.InsideEof
          stringEnd = next[1]
        } else if ((next = part.match(RE_REGEX))) {
          token = TokenType.Regex
          state = State.TopLevelContent
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_VARIABLE_NAME))) {
          token = TokenType.VariableName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.PunctuationString
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_QUOTE_SINGLE))) {
          token = TokenType.Punctuation
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_QUOTE_BACKTICK))) {
          token = TokenType.Punctuation
          state = State.InsideBackTickQuoteString
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else {
          console.log({ part })
          part //?
          throw new Error('no')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_QUOTE_DOUBLE))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideSingleQuoteString:
        if ((next = part.match(RE_QUOTE_SINGLE))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_SINGLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else if ((next = part.match(RE_STRING_ESCAPE))) {
          token = TokenType.String
          state = State.InsideSingleQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideBackTickQuoteString:
        if ((next = part.match(RE_QUOTE_BACKTICK))) {
          token = TokenType.PunctuationString
          state = State.TopLevelContent
        } else if ((next = part.match(RE_STRING_BACKTICK_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideBackTickQuoteString
        } else {
          throw new Error('no')
        }
        break
      case State.InsideEof:
        if ((next = part.match(stringEnd))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_EOF_CONTENT))) {
          token = TokenType.String
          state = State.InsideEof
        } else {
          throw new Error('no')
        }
        break
      default:
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
    stringEnd,
  }
}
