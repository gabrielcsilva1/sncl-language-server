import type { Connection } from 'vscode-languageserver'
import { DefinitionProvider } from './lsp/definition-provider'
import { DocumentUpdateHandler } from './lsp/document-update-handler'
import { RenameProvider } from './lsp/rename-provider'
import { WorkspaceManager } from './workspace/workspace-manager'

export interface SnclServices {
  readonly workspace: {
    readonly WorkspaceManager: WorkspaceManager
  }
  readonly lsp: {
    readonly DocumentUpdateHandler: DocumentUpdateHandler
    readonly DefinitionProvider: DefinitionProvider
    readonly RenameProvider: RenameProvider
  }
}

export function createSnclServices(): SnclServices {
  const workspaceManager = new WorkspaceManager()

  // Capabilities Provider
  const documentUpdateHandler = new DocumentUpdateHandler(workspaceManager)
  const definitionProvider = new DefinitionProvider(workspaceManager)
  const renameProvider = new RenameProvider(workspaceManager)

  return {
    workspace: {
      WorkspaceManager: workspaceManager,
    },
    lsp: {
      DocumentUpdateHandler: documentUpdateHandler,
      DefinitionProvider: definitionProvider,
      RenameProvider: renameProvider,
    },
  }
}

export function registerCapabilities(connection: Connection, services: SnclServices) {
  // go-to-definition
  connection.onDefinition((params) => {
    return services.lsp.DefinitionProvider.findDeclaration(params)
  })

  // rename
  connection.onPrepareRename((params) => services.lsp.RenameProvider.prepareRename(params))
  connection.onRenameRequest((parmas) => services.lsp.RenameProvider.rename(parmas))
}
