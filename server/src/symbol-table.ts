import type { Area, Declaration } from './@types/sncl-types'
import type { ValidationError } from './parser/parser'
import { Scope } from './references/scope'
import type { AstNodeWithName } from './syntax-tree'

export class SymbolTable {
  private _globalScope: Scope
  private nodeScopes: Map<string, Scope>
  private _duplicateErrors: ValidationError[] = []

  public constructor() {
    this._globalScope = new Scope()
    this.nodeScopes = new Map()
  }

  update(declarations: Array<Declaration>) {
    this.clear()
    this.updateRecursive(declarations, this._globalScope)
  }

  private updateRecursive(elements: Array<Declaration | Area>, currentScope: Scope) {
    for (const element of elements) {
      if (element.$type === 'Link' || element.$type === 'MacroCall') {
        continue
      }

      // 1- Verifica se já existe um elemento com o mesmo nome
      if (this.nodeScopes.get(element.name)) {
        this._duplicateErrors.push({
          message: `Duplicated identifier: ${element.name}`,
          location: element.location,
        })
        continue
      }

      // 2- Adiciona o elemento no escopo atual
      currentScope.addElement(element)

      // 3- Cria um escopo para o elemento e adiciona no Map que contém todos os escopos
      const childScope = new Scope(element, currentScope)
      this.nodeScopes.set(element.name, childScope)

      if (element.$type === 'Region') {
        // Regiões ficam no escopo global
        this.updateRecursive(element.children, this._globalScope)
      } else if (element.$type === 'Context') {
        this.updateRecursive(element.children, childScope)
      } else if (element.$type === 'Media') {
        this.updateRecursive(element.children, childScope)
        element.properties.forEach((prop) => {
          childScope.addElement(prop)
        })
      } else if (element.$type === 'Macro') {
        element.parameters.forEach((param) => {
          childScope.addElement(param)
        })
      }
    }
  }

  public getScopeFromNode(node: AstNodeWithName) {
    return this.nodeScopes.get(node.name)
  }

  public clear() {
    this.nodeScopes.clear()
    this._globalScope = new Scope()
    this._duplicateErrors = []
  }

  public get globalScope() {
    return this._globalScope
  }

  get duplicateErrors() {
    return this._duplicateErrors
  }
}
