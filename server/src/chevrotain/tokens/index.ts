import { Lexer } from 'chevrotain'
import { Identifier, WhiteSpaces } from './generic'
import {
  Action,
  Condition,
  ConditionSeparator,
  Context,
  Do,
  End,
  Media,
  Port,
  Region,
} from './keywords'
import { NumberLiteral, StringLiteral, Value } from './literals'
import { Colon, Dot } from './symbols'

// A ordem dos tokens importa
export const allTokens = [
  WhiteSpaces,
  // Palavras chaves
  Context,
  End,
  Media,
  Port,
  Region,
  Condition,
  Action,
  Do,
  ConditionSeparator,
  // Símbolos e literais
  Colon,
  NumberLiteral,
  StringLiteral,
  Dot,
  // Categorias
  Value,
  // O identificador vem por último.
  Identifier,
]

export const sNCLLexer = new Lexer(allTokens, {
  positionTracking: 'onlyOffset',
})
