import type { SnclDocument } from '../workspace/document'
import { DocumentBuilder, type IDocumentBuilder } from '../workspace/document-builder'

export class DocumentUpdateHandler {
  private readonly documentBuilder: IDocumentBuilder

  constructor() {
    this.documentBuilder = new DocumentBuilder()
  }

  onDocumentOpened(uri: string, text: string): SnclDocument {
    return this.documentBuilder.update(uri, text)
  }

  onDocumentChanged(uri: string, newText: string) {
    return this.documentBuilder.update(uri, newText)
  }

  onDocumentDeleted(uri: string) {
    this.documentBuilder.delete(uri)
  }
}
