import { Range, type ReferenceParams, type Location as VSCodeLocation } from 'vscode-languageserver'
import type { Reference } from '../syntax-tree'
import { isNodeAtOffset } from '../utils/ast-utils'
import type { WorkspaceManager } from '../workspace/workspace-manager'

export class ReferenceProvider {
  private workspaceManager: WorkspaceManager

  constructor(workspaceManager: WorkspaceManager) {
    this.workspaceManager = workspaceManager
  }

  findReferences({ textDocument, position }: ReferenceParams): VSCodeLocation[] | null {
    const document = this.workspaceManager.getDocument(textDocument.uri)

    if (!document) {
      return null
    }

    // Transforma position em offset para realizar a busca na árvore
    const offset = document.textDocument.offsetAt(position)

    // Busca o símbolo que está no offset informado
    const reference: Reference | undefined = document.references.find((r) =>
      isNodeAtOffset(r, offset)
    )

    if (!reference || !reference.$ref) {
      return null
    }

    /* Busca todas as referências que apontam para o mesmo símbolo/declaração */
    const originalDecl = reference.$ref

    const allReferences: Reference[] = document.references.filter((r) => {
      return (
        r.$ref?.location.startOffset === originalDecl.location.startOffset &&
        r.$ref.location.endOffset === originalDecl.location.endOffset
      )
    })

    // Cria um objeto que armazena as mudanças no documento
    const allLocations: VSCodeLocation[] = []

    for (const ref of allReferences) {
      const startPos = document.textDocument.positionAt(ref.location.startOffset)
      const endPos = document.textDocument.positionAt(ref.location.endOffset)

      // Adiciona o novo texto e o range no qual a modificação vai ser feita
      allLocations.push({
        range: Range.create(startPos, endPos),
        uri: document.uri,
      })
    }

    return allLocations
  }
}
