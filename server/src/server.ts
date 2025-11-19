import {
  createConnection,
  type InitializeParams,
  type InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextDocuments,
} from 'vscode-languageserver/node'

import { TextDocument } from 'vscode-languageserver-textdocument'
import { DocumentUpdateHandler } from './lsp/document-update-handler'
import { convertErrorToDiagnostic } from './utils/utils'

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

const workspaceManager = new DocumentUpdateHandler()

connection.onInitialize((_: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  }

  return result
})

documents.onDidChangeContent((change) => {
  connection.window.showInformationMessage(`onDidChangeContent: ${change.document.uri}`)

  const document = workspaceManager.onDocumentChanged(
    change.document.uri,
    change.document.getText()
  )

  const diagnostics = document.parseResult.parseErrors.map((error) =>
    convertErrorToDiagnostic(error, change.document)
  )

  connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
