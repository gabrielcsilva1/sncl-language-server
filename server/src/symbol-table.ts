import type * as ast from './@types/sncl-types'

export class SymbolTable {
  private elements: Map<string, ast.Declaration>

  protected constructor() {
    this.elements = new Map<string, ast.Declaration>()
  }

  public getElement(name: string) {
    return this.elements.get(name)
  }

  static from(program: ast.Program): SymbolTable {
    const symbolTable = new SymbolTable()

    for (const declaration of program.declarations) {
      symbolTable.elements.set(declaration.name, declaration)
    }

    return symbolTable
  }
}
