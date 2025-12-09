import type { Program } from '../@types/sncl-types'
import { sNCLParser } from '../chevrotain/parser'
import { sNCLLexer } from '../chevrotain/tokens'
import { sNCLVisitor } from '../chevrotain/visitor'
import type { SymbolTable } from '../symbol-table'
import type { AstNode, Location } from '../syntax-tree'
import { getValidationErrorFromParser, getValidationErrorsFromLexing } from '../utils/utils'

export interface ParseResult<T = AstNode> {
  value: T
  errors: ValidationError[]
}

export interface ValidationError {
  message: string
  location: Location
}

export interface IDocumentParser {
  parse(text: string): ParseResult<Program>
}

export class DocumentParser implements IDocumentParser {
  parse(text: string): ParseResult<Program> {
    const validationErrors: ValidationError[] = []

    // 1 - Gera os tokens
    const lexingResult = sNCLLexer.tokenize(text)

    validationErrors.push(...getValidationErrorsFromLexing(lexingResult.errors))

    // 2 - Realiza o parsing
    sNCLParser.input = lexingResult.tokens

    const cst = sNCLParser.program()

    validationErrors.push(...getValidationErrorFromParser(sNCLParser.errors, text.length))

    // 3 - Gera a AST do resultado da fase de parsing
    let astResult = sNCLVisitor.visit(cst) as Omit<Program, 'location'> | undefined

    if (!astResult) {
      astResult = getEmptyProgram(text.length)
    }

    // Preenche a location
    const parseResult: ParseResult<Program> = {
      value: {
        ...astResult,
        location: {
          startOffset: 0,
          endOffset: text.length - 1,
        },
      },
      errors: validationErrors,
    }

    return parseResult
  }
}

function getEmptyProgram(length: number): Program {
  return {
    $type: 'Program',
    declarations: [],
    location: {
      startOffset: 0,
      endOffset: length - 1,
    },
  }
}
