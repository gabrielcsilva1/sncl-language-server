import { type ILinker, Linker } from '../references/linker'
import { DocumentValidator, type IDocumentValidator } from '../validation/validation'
import {
  DocumentState,
  type ISnclDocumentFactory,
  type SnclDocument,
  SnclDocumentFactory,
} from './document'

/**
 * Serviço responsável por atualizar `SnclDocument` documentos.
 */
export interface IDocumentBuilder {
  /**
   * Método chamado quando um documento é criado ou alterado.
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

export class DocumentBuilder implements IDocumentBuilder {
  private readonly documentFactory: ISnclDocumentFactory
  private readonly linkerService: ILinker
  private readonly validationService: IDocumentValidator
  private readonly snclDocuments: Map<string, SnclDocument>

  constructor() {
    this.documentFactory = new SnclDocumentFactory()
    this.linkerService = new Linker()
    this.validationService = new DocumentValidator()
    this.snclDocuments = new Map()
  }

  update(uri: string, text: string): SnclDocument {
    let document = this.snclDocuments.get(uri)

    if (document === undefined) {
      document = this.documentFactory.from(uri, text)
    }

    this.buildDocument(document, text)

    return document
  }

  delete(uri: string): void {
    this.snclDocuments.delete(uri)
  }

  private buildDocument(document: SnclDocument, newText: string): void {
    // 1. Parsing
    this.runCommand(document, DocumentState.Parsed, () => {
      this.documentFactory.update(document, newText)
    })

    // 2. Linking
    this.runCommand(document, DocumentState.Linked, () => {
      this.linkerService.link(document)
    })

    // 3. Validação
    this.runCommand(document, DocumentState.Validated, () => {
      this.validationService.validate(document)
    })
  }

  private runCommand(
    document: SnclDocument,
    targetState: DocumentState,
    callback: (document: SnclDocument) => unknown
  ) {
    if (document.state < targetState) {
      callback(document)
      document.state = targetState
    }
  }
}
