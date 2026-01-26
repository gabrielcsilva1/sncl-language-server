import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { SnclDocument } from '../workspace/document'
import type { WorkspaceManager } from '../workspace/workspace-manager'

export class DocumentUpdateHandler {
  private readonly workspaceManager: WorkspaceManager

  constructor(workspaceManager: WorkspaceManager) {
    this.workspaceManager = workspaceManager
  }

  onDocumentOpened(textDocument: TextDocument): SnclDocument {
    return this.workspaceManager.updateDocument(textDocument)
  }

  onDocumentChanged(textDocument: TextDocument) {
    return this.workspaceManager.updateDocument(textDocument)
  }

  onDocumentDeleted(uri: string) {
    this.workspaceManager.deleteDocument(uri)
  }
}
