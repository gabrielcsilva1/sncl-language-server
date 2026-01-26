import type { TextDocument } from 'vscode-languageserver-textdocument'
import { type ISnclDocumentFactory, type SnclDocument, SnclDocumentFactory } from './document'

/**
 * Serviço responsável por atualizar `SnclDocument` documentos.
 */
export interface IWorkspaceManager {
  /**
   * Método chamado quando um documento é aberto ou alterado.
   * @param uri - URI do documento que foi criado ou alterado
   * @param text - texto do documento.
   */
  update(textDocument: TextDocument): SnclDocument

  /**
   * Método chamado quando um documento é deletado.
   * @param uri - URI do documento excluído
   */
  delete(uri: string): void
}

export class WorkspaceManager implements IWorkspaceManager {
  private readonly documentFactory: ISnclDocumentFactory
  private readonly snclDocuments: Map<string, SnclDocument>

  constructor(snclDocuments: Map<string, SnclDocument>) {
    this.documentFactory = new SnclDocumentFactory()
    this.snclDocuments = snclDocuments
  }

  update(textDocument: TextDocument): SnclDocument {
    let document = this.snclDocuments.get(textDocument.uri)

    if (document === undefined) {
      document = this.documentFactory.createFrom(textDocument)
    }

    this.documentFactory.update(document, textDocument.getText())

    this.snclDocuments.set(textDocument.uri, document)

    return document
  }

  delete(uri: string): void {
    this.snclDocuments.delete(uri)
  }
}
