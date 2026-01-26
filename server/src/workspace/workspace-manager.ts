import type { TextDocument } from 'vscode-languageserver-textdocument'
import { type ISnclDocumentFactory, type SnclDocument, SnclDocumentFactory } from './document'

/**
 * Serviço responsável por atualizar `SnclDocument` documentos.
 */
export class WorkspaceManager {
  private readonly documentFactory: ISnclDocumentFactory
  private readonly snclDocuments: Map<string, SnclDocument>

  constructor() {
    this.documentFactory = new SnclDocumentFactory()
    this.snclDocuments = new Map()
  }

  getDocument(uri: string) {
    return this.snclDocuments.get(uri)
  }

  /**
   * Método chamado quando um documento é aberto ou alterado.
   */
  updateDocument(textDocument: TextDocument): SnclDocument {
    let document = this.snclDocuments.get(textDocument.uri)

    if (document === undefined) {
      document = this.documentFactory.createFrom(textDocument)
    }

    this.documentFactory.update(document, textDocument.getText())

    this.snclDocuments.set(textDocument.uri, document)

    return document
  }

  /**
   * Método chamado quando um documento é deletado.
   * @param uri - URI do documento excluído
   */
  deleteDocument(uri: string): void {
    this.snclDocuments.delete(uri)
  }
}
