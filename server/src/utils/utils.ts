import type { ILexingError, IRecognitionException, IToken } from 'chevrotain'
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ValidationError } from '../parser/parser'
import type { AstNode, Location, Reference } from '../syntax-tree'

export function getLocationFromToken(startNode: IToken, endNode?: IToken): Location {
  endNode = endNode ?? startNode

  return {
    startOffset: startNode.startOffset,
    endOffset: endNode.startOffset + endNode.image.length,
  }
}

export function getValidationErrorsFromLexing(errors: ILexingError[]): ValidationError[] {
  const validationErrors: ValidationError[] = []

  errors.forEach((error) => {
    validationErrors.push({
      message: error.message,
      location: {
        startOffset: error.offset,
        endOffset: error.offset + error.length,
      },
    })
  })

  return validationErrors
}

export function getValidationErrorFromParser(
  errors: IRecognitionException[],
  textLength: number
): ValidationError[] {
  const validationError: ValidationError[] = []

  errors.forEach((error) => {
    let startOffset = error.token.startOffset
    let endOffset = startOffset + error.token.image.length

    if (Number.isNaN(error.token.startOffset)) {
      // Ocorre quado espera um próximo token (X), mas encontra um EOF ou token outro token (Y), sendo o ultimo token.
      startOffset = textLength - 1
      endOffset = textLength
    }

    validationError.push({
      message: error.message,
      location: {
        startOffset,
        endOffset,
      },
    })
  })

  return validationError
}

export function convertErrorToDiagnostic(
  error: ValidationError,
  textDocument: TextDocument
): Diagnostic {
  const start = textDocument.positionAt(error.location.startOffset)
  const end = textDocument.positionAt(error.location.endOffset)

  return {
    severity: DiagnosticSeverity.Error,
    range: { start, end },
    message: error.message,
    source: 'sNCL Language Server',
  }
}

/**
 * Cria um objeto do tipo {@link Reference}.
 * @template T - Tipo do nó, no qual a referência é feita.
 * @param token - Token que vai ser extraído as informações do id e localização da referência
 */
export function makeReference<T extends AstNode>(token: IToken): Reference<T> {
  return {
    $type: 'Reference',
    $name: token.image,
    // O campo $ref é preenchido pelo Linker
    location: getLocationFromToken(token),
  }
}
