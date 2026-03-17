import type { ILexingError, IRecognitionException } from 'chevrotain'
import { type Diagnostic, DiagnosticSeverity } from 'vscode-languageserver'
import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { ValidationError } from '../parser/parser'

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

export function isStringLiteral(value: string) {
  return value.startsWith('"') && value.endsWith('"')
}

export function removeQuotes(value: string) {
  return value.replace(/["']/g, '')
}
