import type { SnclDocument } from '../workspace/document'
import { type IWorkspaceManager, WorkspaceManager } from '../workspace/workspace-manager'

export class DocumentUpdateHandler {
  private readonly workspaceManager: IWorkspaceManager

  constructor() {
    this.workspaceManager = new WorkspaceManager()
  }

  onDocumentOpened(uri: string, text: string): SnclDocument {
    return this.workspaceManager.update(uri, text)
  }

  onDocumentChanged(uri: string, newText: string) {
    return this.workspaceManager.update(uri, newText)
  }

  onDocumentDeleted(uri: string) {
    this.workspaceManager.delete(uri)
  }
}
