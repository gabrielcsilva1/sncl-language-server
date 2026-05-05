import {
  type PrepareRenameParams,
  type PrepareRenameResult,
  Range,
  type RenameParams,
  type TextEdit,
  type WorkspaceEdit,
} from 'vscode-languageserver'
import type { Reference } from '../syntax-tree'
import { isNodeAtOffset } from '../utils/ast-utils'
import type { WorkspaceManager } from '../workspace/workspace-manager'

export class RenameProvider {
  private workspaceManager: WorkspaceManager

  constructor(workspaceManager: WorkspaceManager) {
    this.workspaceManager = workspaceManager
  }

  rename({ position, newName, textDocument }: RenameParams): WorkspaceEdit | null {
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
    const changes: { [uri: string]: TextEdit[] } = {
      [document.uri]: [], // uri: Array com as mudanças
    }

    for (const ref of allReferences) {
      const startPos = document.textDocument.positionAt(ref.location.startOffset)
      const endPos = document.textDocument.positionAt(ref.location.endOffset)

      // Adiciona o novo texto e o range no qual a modificação vai ser feita
      changes[document.uri].push({
        newText: newName,
        range: Range.create(startPos, endPos),
      })
    }

    return { changes }
  }

  prepareRename({ position, textDocument }: PrepareRenameParams): PrepareRenameResult | null {
    const document = this.workspaceManager.getDocument(textDocument.uri)

    if (!document) {
      return null
    }

    // Transforma position em offset para realizar a busca na árvore
    const offset = document.textDocument.offsetAt(position)

    // Busca o simbolo que está no offset informado
    const reference: Reference | undefined = document.references.find(
      (r) => r.location.startOffset <= offset && r.location.endOffset >= offset
    )

    if (!reference || !reference.$ref) {
      return null
    }

    // Extrai a Position do começo e do fim do símbolo, necessário para criar o Range
    const startPos = document.textDocument.positionAt(reference.location.startOffset)
    const endPos = document.textDocument.positionAt(reference.location.endOffset)

    return {
      placeholder: reference.$name,
      range: Range.create(startPos, endPos),
    }
  }
}
