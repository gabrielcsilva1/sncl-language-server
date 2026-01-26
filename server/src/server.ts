import {
  createConnection,
  type InitializeParams,
  type InitializeResult,
  ProposedFeatures,
  TextDocumentSyncKind,
  TextDocuments,
} from 'vscode-languageserver/node'

import { TextDocument } from 'vscode-languageserver-textdocument'
import { createSnclServices, registerCapabilities } from './services'
import { convertErrorToDiagnostic } from './utils/utils'

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

connection.onInitialize((_: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      definitionProvider: true,
    },
  }

  return result
})

const services = createSnclServices()

// Registra todas as capabilities definidas em connection.onInitialize
registerCapabilities(connection, services)

documents.onDidChangeContent((change) => {
  const document = services.lsp.DocumentUpdateHandler.onDocumentChanged(change.document)

  const diagnostics = document.parseResult.errors.map((error) =>
    convertErrorToDiagnostic(error, change.document)
  )

  connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
