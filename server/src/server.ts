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
import { DefinitionProvider } from './lsp/definition-provider'
import type { SnclDocument } from './workspace/document'

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all)

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument)

const snclDocuments = new Map<string, SnclDocument>()
const workspaceManager = new DocumentUpdateHandler(snclDocuments)
const definitionProvider = new DefinitionProvider(snclDocuments)

connection.onInitialize((_: InitializeParams) => {
  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      definitionProvider: true,
    },
  }

  return result
})

documents.onDidChangeContent((change) => {
  const document = workspaceManager.onDocumentChanged(change.document)

  const diagnostics = document.parseResult.errors.map((error) =>
    convertErrorToDiagnostic(error, change.document)
  )

  connection.sendDiagnostics({ uri: change.document.uri, diagnostics })
})

connection.onDefinition((params) => {
  return definitionProvider.findDeclaration(params)
})

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// Listen on the connection
connection.listen()
