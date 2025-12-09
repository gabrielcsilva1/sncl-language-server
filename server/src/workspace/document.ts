import type { Program } from '../@types/sncl-types'
import { DocumentParser, type IDocumentParser, type ParseResult } from '../parser/parser'
import { link } from '../references/linker'
import { SymbolTable } from '../symbol-table'
import { validateDocument } from '../validation/validation'

export interface SnclDocument {
  /** A URI do documento */
  uri: string

  /** O texto do documento que foi usado para gerar a AST */
  text: string

  /** O resultado do parser, pode conter os erros de parser/lexer */
  parseResult: ParseResult<Program>

  symbolTable: SymbolTable
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
  createFrom(uri: string, text: string): SnclDocument

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

  createFrom(uri: string, text: string): SnclDocument {
    const parseResult = this.parserService.parse(text)
    const symbolTable = new SymbolTable()
    symbolTable.update(parseResult.value)

    const document: SnclDocument = {
      uri,
      text,
      parseResult: parseResult,
      symbolTable: symbolTable,
    }

    return document
  }

  update(document: SnclDocument, newText: string): SnclDocument {
    // 1. Parsing
    if (document.text !== newText) {
      document.text = newText
      document.parseResult = this.parserService.parse(newText)
      document.symbolTable.update(document.parseResult.value)
    }

    // 2. Linking
    link(document)

    // 3. Validação
    validateDocument(document)

    return document
  }
}
