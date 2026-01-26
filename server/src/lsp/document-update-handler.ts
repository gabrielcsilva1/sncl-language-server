import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { SnclDocument } from '../workspace/document'
import { type IWorkspaceManager, WorkspaceManager } from '../workspace/workspace-manager'

export class DocumentUpdateHandler {
  private readonly workspaceManager: IWorkspaceManager

  constructor(snclDocuments: Map<string, SnclDocument>) {
    this.workspaceManager = new WorkspaceManager(snclDocuments)
  }

  onDocumentOpened(textDocument: TextDocument): SnclDocument {
    return this.workspaceManager.update(textDocument)
  }

  onDocumentChanged(textDocument: TextDocument) {
    return this.workspaceManager.update(textDocument)
  }

  onDocumentDeleted(uri: string) {
    this.workspaceManager.delete(uri)
  }
}
