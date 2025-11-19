import { createToken, Lexer } from 'chevrotain'
import { Value } from './literals'

const identifierPattern = /[a-zA-Z_]\w*/

export const identifierPatternExact = new RegExp(`^${identifierPattern.source}$`)

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
