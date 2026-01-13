import type { Declaration } from './@types/sncl-types'
import type { ValidationError } from './parser/parser'

export class SymbolTable {
  private elements: Map<string | number, Declaration>
  private _duplicateErrors: ValidationError[] = []

  public constructor() {
    this.elements = new Map()
  }

  update(declarations: Array<Declaration>) {
    this.clear()
    this.updateRecursive(declarations)
  }

  private updateRecursive(elements: Array<Declaration>) {
    for (const element of elements) {
      this.addElement(element)

      if (element.$type === 'Region' || element.$type === 'Context') {
        this.updateRecursive(element.children)
      }
    }
  }

  public addElement(element: Declaration) {
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
