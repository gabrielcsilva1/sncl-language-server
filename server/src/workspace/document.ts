import type { TextDocument } from 'vscode-languageserver-textdocument'
import type { Declaration } from '../@types/sncl-types'
import { processMacroCall } from '../macro-resolver'
import { DocumentParser, type IDocumentParser, type ParseResult } from '../parser/parser'
import { link } from '../references/linker'
import { SymbolTable } from '../symbol-table'
import type { Reference } from '../syntax-tree'
import { validateDocument } from '../validation/validation'

export interface SnclDocument {
  /** A URI do documento */
  readonly uri: string

  readonly textDocument: TextDocument

  /** O texto do documento que foi usado para gerar a AST */
  text: string

  /** O resultado do parser, pode conter os erros de parser/lexer */
  parseResult: ParseResult<Declaration[]>

  symbolTable: SymbolTable

  references: Array<Reference>
}

/**
 * Serviço responsável por criar e atualizar instâncias de `SnclDocument`.
 */
export interface ISnclDocumentFactory {
  /**
   * Cria uma nova instância de `SnclDocument` com a AST gerada.
   * @param uri - uri do documento.
   * @param text - texto do documento.
   */
  createFrom(textDocument: TextDocument): SnclDocument

  /**
   * Atualiza o estado do documento, efetua o parsing, linking e
   * validação caso o texto tenha sido alterado.
   * @param document - `SnclDocument` documento alterado.
   * @param newText - novo texto do documento.
   */
  update(document: SnclDocument, newText: string): SnclDocument
}

export class SnclDocumentFactory implements ISnclDocumentFactory {
  private readonly parserService: IDocumentParser

  constructor() {
    this.parserService = new DocumentParser()
  }

  createFrom(textDocument: TextDocument): SnclDocument {
    const text = textDocument.getText()

    const parseResult = this.parserService.parse(text)
    const symbolTable = new SymbolTable()
    symbolTable.update(parseResult.value)

    const document: SnclDocument = {
      uri: textDocument.uri,
      text,
      textDocument,
      parseResult: parseResult,
      symbolTable: symbolTable,
      references: [],
    }

    processMacroCall(document)

    return document
  }

  update(document: SnclDocument, newText: string): SnclDocument {
    // 1. Parsing
    if (document.text !== newText) {
      document.text = newText
      document.parseResult = this.parserService.parse(newText)
      document.symbolTable.update(document.parseResult.value)
      document.references = []
      processMacroCall(document)
    }

    // 2. Linking
    link(document)

    // 3. Validação
    validateDocument(document)

    return document
  }
}
