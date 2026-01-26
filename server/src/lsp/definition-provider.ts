import {
  Range,
  type DefinitionParams,
  type Location as VSCodeLocation,
} from 'vscode-languageserver'
import type { SnclDocument } from '../workspace/document'

export class DefinitionProvider {
  private snclDocuments: Map<string, SnclDocument>

  constructor(snclDocuments: Map<string, SnclDocument>) {
    this.snclDocuments = snclDocuments
  }

  findDeclaration({ textDocument, position }: DefinitionParams): VSCodeLocation | null {
    const document = this.snclDocuments.get(textDocument.uri)

    if (!document) {
      return null
    }

    const offset = document.textDocument.offsetAt(position)

    const reference = document.references.find(
      (r) => r.location.startOffset <= offset && r.location.endOffset >= offset
    )

    if (!reference || !reference.$ref) {
      return null
    }

    const startPos = document.textDocument.positionAt(reference.$ref.location.startOffset)
    const endPos = document.textDocument.positionAt(reference.$ref.location.endOffset)

    return {
      uri: document.textDocument.uri,
      range: Range.create(startPos, endPos),
    }
  }
}
