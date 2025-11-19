/**
 * Interface base para todos os nós da Árvore de Sintaxe Abstrata (AST)
 */
export interface AstNode {
  /** Todo nó da AST tem um tipo */
  $type: string

  /**
   * Referência ao nó pai na AST.
   * Essencial para subir na arvore e encontrar escopos.
   */
  $container?: AstNode

  /** Localização de onde começa e termina nó */
  location: Location
}

export interface Location {
  startOffset: number
  endOffset: number
}

// Uma interface genérica para representar uma referência.
export interface Reference<T extends AstNode = AstNode> {
  $type: 'Reference'

  /** O identificador do nó */
  $name: string

  /** A referência resolvida para o nó da AST. */
  $ref?: T

  location: Location
}
