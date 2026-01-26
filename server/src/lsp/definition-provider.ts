import {
  type DefinitionParams,
  Range,
  type Location as VSCodeLocation,
} from 'vscode-languageserver'
import type { WorkspaceManager } from '../workspace/workspace-manager'

export class DefinitionProvider {
  private workspaceManager: WorkspaceManager

  constructor(workspaceManager: WorkspaceManager) {
    this.workspaceManager = workspaceManager
  }

  findDeclaration({ textDocument, position }: DefinitionParams): VSCodeLocation | null {
    const document = this.workspaceManager.getDocument(textDocument.uri)

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
