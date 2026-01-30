import * as path from 'node:path'
import * as vscode from 'vscode'

import {
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node'
import { makeTerminalManager } from './terminal/terminal-factory'
import type { TerminalManager } from './terminal/terminal-manager'

let client: LanguageClient
let terminalManager: TerminalManager

export function activate(context: vscode.ExtensionContext) {
  /**
   * Registrando o comando para chamar o sncl via terminal.
   */
  terminalManager = makeTerminalManager(context)

  const disposable = vscode.commands.registerCommand('sncl.compile', async () => {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      vscode.window.showErrorMessage('Nenhum editor de texto ativo.')
      return
    }

    const document = editor.document

    if (document.languageId !== 'sncl') {
      vscode.window.showErrorMessage('Abra um arquivo .sncl para compilar.')
      return
    }

    await terminalManager.runSnclCommand(document.fileName)
  })

  context.subscriptions.push(disposable)
  context.subscriptions.push(terminalManager)

  /**
   * Configuração do LSP
   */
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(path.join('dist', 'server.js'))

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for all documents by default
    documentSelector: [{ scheme: 'file', language: 'sncl' }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      // fileEvents: workspace.createFileSystemWatcher("**/.snclrc"),
    },
  }

  // Create the language client and start the client.
  client = new LanguageClient(
    'sncl-language-server',
    'sNCL language server',
    serverOptions,
    clientOptions
  )

  // Start the client. This will also launch the server
  client.start()
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
