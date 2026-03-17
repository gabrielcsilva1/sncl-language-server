import type { AstNodeWithName } from '../syntax-tree'

export class Scope<T extends AstNodeWithName = AstNodeWithName> {
  private _ownerNode?: T
  protected elements = new Map<string, AstNodeWithName>()
  private parentScope?: Scope

  constructor()
  constructor(ownerNode: T, parentScope: Scope)

  constructor(ownerNode?: T, parentScope?: Scope) {
    this._ownerNode = ownerNode
    this.parentScope = parentScope
  }

  public addElement(element: AstNodeWithName) {
    if (this.elements.get(element.name)) return

    this.elements.set(element.name, element)
  }

  public resolve(name: string): AstNodeWithName | undefined {
    return this.elements.get(name) ?? this.parentScope?.resolve(name)
  }

  public resolveLocalOnly(name: string) {
    return this.elements.get(name)
  }

  get ownerNode() {
    return this._ownerNode
  }
}
