import { createToken, Lexer } from 'chevrotain'

export const Value = createToken({
  name: 'Value',
  pattern: Lexer.NA,
})

export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"[^"]*"/,
  categories: [Value],
})

export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /\d+/,
  categories: [Value],
})
