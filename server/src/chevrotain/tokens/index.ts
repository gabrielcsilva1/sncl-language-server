import { Lexer } from 'chevrotain'
import { Identifier, WhiteSpaces } from './generic'
import { End, Media, Port, Region } from './keywords'
import { NumberLiteral, StringLiteral, Value } from './literals'
import { Colon } from './symbols'

// A ordem dos tokens importa
export const allTokens = [
  WhiteSpaces,
  // Palavras chaves
  End,
  Media,
  Port,
  Region,
  // Símbolos e literais
  Colon,
  NumberLiteral,
  StringLiteral,
  // Categorias
  Value,
  // O identificador vem por último.
  Identifier,
]

export const sNCLLexer = new Lexer(allTokens, {
  positionTracking: 'onlyOffset',
})
