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
  update(uri: string, text: string): SnclDocument

  /**
   * Método chamado quando um documento é deletado.
   * @param uri - URI do documento excluído
   */
  delete(uri: string): void
}

export class WorkspaceManager implements IWorkspaceManager {
  private readonly documentFactory: ISnclDocumentFactory
  private readonly snclDocuments: Map<string, SnclDocument>

  constructor() {
    this.documentFactory = new SnclDocumentFactory()
    this.snclDocuments = new Map()
  }

  update(uri: string, text: string): SnclDocument {
    let document = this.snclDocuments.get(uri)

    if (document === undefined) {
      document = this.documentFactory.from(uri, text)
    }

    this.documentFactory.update(document, text)

    this.snclDocuments.set(uri, document)

    return document
  }

  delete(uri: string): void {
    this.snclDocuments.delete(uri)
  }
}
