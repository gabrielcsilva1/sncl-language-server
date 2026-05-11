import {
  type DefinitionParams,
  Range,
  type Location as VSCodeLocation,
} from 'vscode-languageserver'
import type { WorkspaceManager } from '../workspace/workspace-manager'
import type { Location } from '../syntax-tree'

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

    // Busca o elemento que está com o `hover`
    const reference = document.references.find(
      (r) => r.location.startOffset <= offset && r.location.endOffset >= offset
    )

    if (!reference || !reference.$ref) {
      return null
    }

    let location: Location | undefined
    // Se a declaração original for um nó virtual, a definição aponta para a macroCall
    if (reference.$ref.isVirtual && reference.$ref.callLocation) {
      location = reference.$ref.callLocation
    } else {
      // Caso contrário, aponta para a declaração original
      location = reference.$ref.location
    }
    const startPos = document.textDocument.positionAt(location.startOffset)
    const endPos = document.textDocument.positionAt(location.endOffset)

    return {
      uri: document.textDocument.uri,
      range: Range.create(startPos, endPos),
    }
  }
}
