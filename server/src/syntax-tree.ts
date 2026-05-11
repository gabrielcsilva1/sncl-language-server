/**
 * Interface base para todos os nós da Árvore de Sintaxe Abstrata (AST)
 */
export interface AstNode {
  /** Todo nó da AST tem um tipo */
  $type: string

  /**
   * Referência ao nó pai na AST (opcional).
   * Essencial para subir na arvore e encontrar escopos.
   */
  $container?: AstNode

  /**
   * Indica se um elemento foi gerado a partir de uma macro
   */
  isVirtual?: boolean

  /**
   * Quando o elemento é gerado por uma macroCall (isVirtual = true), essa propriedade é
   * preenchida com a mesma localização da respectiva macroCall.
   */
  callLocation?: Location

  /**
   * Localização de onde começa e termina nó no documento.
   * */
  location: Location
}

export interface Location {
  startOffset: number
  endOffset: number
}

export type AstNodeWithName = AstNode & { name: string }

/**
 * Uma interface que representar uma referência a outro elemento ({@link AstNode}).
 * A referência pode ou não ser resolvida.
 *  */
export interface Reference<T extends AstNodeWithName = AstNodeWithName> extends AstNode {
  $type: 'Reference'

  /** O identificador do elemento */
  $name: string

  /**
   * A referência resolvida na fase de `Link`. Caso não seja resolvida a referência
   * fica com o valor `undefined`.
   * */
  $ref?: T
}
