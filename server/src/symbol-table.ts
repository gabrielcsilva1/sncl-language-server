import type * as ast from './@types/sncl-types'
import type { ValidationError } from './parser/parser'

export class SymbolTable {
  private elements: Map<string | number, ast.Declaration>
  private _duplicateErrors: ValidationError[] = []

  public constructor() {
    this.elements = new Map()
  }

  update(program: ast.Program) {
    this.clear()

    for (const declaration of program.declarations) {
      this.addElement(declaration)

      if (declaration.$type === 'Region') {
        this.updateNodeRecursive(declaration.children)
      }
    }
  }

  private updateNodeRecursive(nodeList: ast.Region[]) {
    for (const node of nodeList) {
      this.addElement(node)
      this.updateNodeRecursive(node.children)
    }
  }

  public addElement(element: ast.Declaration) {
    if (element.$type === 'Link') {
      const length = this.elements.size
      this.elements.set(length, element)
      return
    } else if (this.elements.get(element.name)) {
      this._duplicateErrors.push({
        message: `Duplicated identifier: ${element.name}`,
        location: element.location,
      })
    }

    this.elements.set(element.name, element)
  }

  public getElement(name: string) {
    return this.elements.get(name)
  }

  public clear() {
    this.elements.clear()
    this._duplicateErrors = []
  }

  get duplicateErrors() {
    return this._duplicateErrors
  }
}
