import { createToken, Lexer } from 'chevrotain'
import { Value } from './literals'

export const identifierPattern = /[a-zA-Z_]\w*/

export const Identifier = createToken({
  name: 'Identifier',
  pattern: identifierPattern,
  categories: [Value],
})

export const WhiteSpaces = createToken({
  name: 'WhiteSpaces',
  pattern: /\s+/,
  group: Lexer.SKIPPED,
})
