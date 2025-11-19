import type { Program } from '../@types/sncl-types'
import { DocumentParser, type IDocumentParser, type ParseResult } from '../parser/parser'

export interface SnclDocument {
  /** A URI do documento */
  uri: string

  /** O texto do documento que foi usado para gerar a AST */
  text: string

  /** O resultado do parser, pode conter os erros de parser/lexer */
  parseResult: ParseResult<Program>

  /** O estado atual do documento. */
  state: DocumentState
}

export enum DocumentState {
  /** O documento foi alterado, mas nenhum processamento foi feito ainda. */
  Changed = 0,
  /** O texto foi analisado (parsing) e o AST foi gerado. */
  Parsed = 1,
  /** As referências (links) da AST foram resolvidas. */
  Linked = 2,
  /** As validações semânticas foram realizadas */
  Validated = 3,
}

/**
 * Serviço responsável por criar instâncias de `SnclDocument`.
 */
export interface ISnclDocumentFactory {
  /**
   * Cria uma nova instância de `SnclDocument` com a AST gerada.
   * @param uri - uri do documento.
   * @param text - texto do documento.
   */
  from(uri: string, text: string): SnclDocument

  /**
   * Atualiza o estado do documento, efetua o parsing do texto
   * caso o texto tenha sido alterado.
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

  from(uri: string, text: string): SnclDocument {
    const document: SnclDocument = {
      uri,
      text,
      parseResult: this.parserService.parse(text),
      state: DocumentState.Parsed,
    }

    return document
  }

  update(document: SnclDocument, newText: string): SnclDocument {
    if (document.text !== newText) {
      document.text = newText
      document.parseResult = this.parserService.parse(newText)
    }

    document.state = DocumentState.Parsed

    return document
  }
}
