import { Lexer } from 'chevrotain'
import { Identifier, WhiteSpaces } from './generic'
import {
  Action,
  Area,
  Condition,
  ConditionSeparator,
  Context,
  Do,
  End,
  Macro,
  Media,
  Port,
  Region,
} from './keywords'
import { NumberLiteral, StringLiteral, Value } from './literals'
import { Colon, Comma, Dot, LParen, RParen } from './symbols'

// A ordem dos tokens importa
export const allTokens = [
  WhiteSpaces,
  // Palavras chaves
  Area,
  Context,
  End,
  Media,
  Port,
  Region,
  Condition,
  Action,
  Do,
  ConditionSeparator,
  Macro,
  // Símbolos e literais
  Colon,
  NumberLiteral,
  StringLiteral,
  Dot,
  Comma,
  LParen,
  RParen,
  // Categorias
  Value,
  // O identificador vem por último.
  Identifier,
]

export const sNCLLexer = new Lexer(allTokens, {
  positionTracking: 'onlyOffset',
})
