import type {
  Action,
  Area,
  Argument,
  Condition,
  Context,
  Declaration,
  InterfaceRefTypes,
  Link,
  Macro,
  MacroCall,
  Media,
  Port,
  Property,
  PropertyValue,
  Region,
} from '../@types/sncl-types'
import type { AstNodeWithName, Reference } from '../syntax-tree'
import { isMacro, isParameter } from '../utils/ast-utils'
import type { SnclDocument } from '../workspace/document'
import type { Scope } from './scope'

export function link(document: SnclDocument): void {
  document.references = []

  const linker = new Linker()

  linker.link(document)

  document.references = document.references.filter((ref) => !ref.isVirtual)
}

type LinkerParams = {
  document: SnclDocument
  currentScope: Scope
}

abstract class LinkerBase {
  public link(document: SnclDocument) {
    for (const declaration of document.parseResult.value) {
      this.visitDeclaration(declaration, {
        document,
        currentScope: document.symbolTable.globalScope,
      })
    }
  }

  protected abstract visitDeclaration(declaration: Declaration, params: LinkerParams): void
  protected abstract visitRegion(node: Region, params: LinkerParams): void
  protected abstract visitMedia(node: Media, params: LinkerParams): void
  protected abstract visitArea(node: Area, params: LinkerParams): void
  protected abstract visitPort(node: Port, params: LinkerParams): void
  protected abstract visitLink(node: Link, params: LinkerParams): void
  protected abstract visitContext(node: Context, params: LinkerParams): void
  protected abstract visitProperty(node: Property, params: LinkerParams): void
  protected abstract visitValue(node: PropertyValue, params: LinkerParams): void
  protected abstract visitMacro(node: Macro, params: LinkerParams): void
  protected abstract visitMacroCall(node: MacroCall, params: LinkerParams): void
}

class Linker extends LinkerBase {
  protected visitDeclaration(node: Declaration, params: LinkerParams) {
    if (node.$type === 'Region') {
      this.visitRegion(node, params)
    } else if (node.$type === 'Media') {
      this.visitMedia(node, params)
    } else if (node.$type === 'Port') {
      this.visitPort(node, params)
    } else if (node.$type === 'Link') {
      this.visitLink(node, params)
    } else if (node.$type === 'Context') {
      this.visitContext(node, params)
    } else if (node.$type === 'MacroCall') {
      this.visitMacroCall(node, params)
    } else if (node.$type === 'Macro') {
      this.visitMacro(node, params)
    }
  }

  protected visitRegion(node: Region, params: LinkerParams): void {
    this.linkDefinition(node, params)
  }

  protected visitMedia(node: Media, params: LinkerParams) {
    const { document, currentScope } = params
    // 1- Resolve a definição
    this.linkDefinition(node, params)

    // 2- Resolve a referencia da região
    if (node.rg) {
      node.rg.$ref = getReference(node.rg, currentScope, ['Region', 'Parameter'])

      if (node.rg.$ref) {
        document.references.push(node.rg)
      }
    }

    // 3- Resolve a referência das propriedades em caso de filhos de macros
    node.properties.forEach((property) => {
      this.visitProperty(property, params)
    })

    // 4- Resolve as definições de areas
    node.children.forEach((area) => {
      this.visitArea(area, params)
    })
  }

  protected visitArea(node: Area, params: LinkerParams) {
    // 1- Resolve a definição
    this.linkDefinition(node, params)
  }

  protected visitPort(node: Port, params: LinkerParams) {
    const { document, currentScope } = params
    this.linkDefinition(node, params)
    linkComponentAndInterface(node, document, currentScope)
  }

  protected visitLink(node: Link, params: LinkerParams) {
    const { document, currentScope } = params

    // Conditions
    for (const bind of node.conditions) {
      linkComponentAndInterface(bind, document, currentScope)
    }

    // Actions
    for (const bind of node.actions) {
      linkComponentAndInterface(bind, document, currentScope)
    }
  }

  protected visitContext(node: Context, params: LinkerParams) {
    const { document, currentScope } = params

    this.linkDefinition(node, params)

    const isMacroSon = currentScope.ownerNode && isMacro(currentScope.ownerNode)

    const nextScope = document.symbolTable.getScopeFromNode(node)

    if (isMacroSon || nextScope === undefined) {
      node.children.forEach((son) => {
        this.visitDeclaration(son, params)
      })
    } else {
      node.children.forEach((son) => {
        this.visitDeclaration(son, {
          document,
          currentScope: nextScope,
        })
      })
    }
  }

  protected visitProperty(node: Property, params: LinkerParams) {
    const { document } = params

    document.references.push(createReference(node, node))

    this.visitValue(node.$value, params)
  }

  protected visitValue(node: PropertyValue | Argument, params: LinkerParams) {
    const { document, currentScope } = params

    // O valor pode ser referência a um parâmetro
    const localReference = currentScope.resolveLocalOnly(node.name)

    if (localReference && isParameter(localReference)) {
      document.references.push(createReference(node, localReference))
    }
  }

  protected visitMacroCall(node: MacroCall, params: LinkerParams) {
    const { document, currentScope } = params
    node.macro.$ref = getReference(node.macro, currentScope, ['Macro'])

    if (node.macro.$ref) {
      document.references.push(node.macro)
    }

    node.arguments.forEach((arg) => {
      this.visitValue(arg, params)
    })
  }

  protected visitMacro(node: Macro, params: LinkerParams) {
    const { document } = params

    document.references.push(createReference(node, node))

    const nextScope = document.symbolTable.getScopeFromNode(node)

    node.parameters.forEach((param) => {
      document.references.push(createReference(param, param))
    })

    if (nextScope) {
      node.children.forEach((son) => {
        this.visitDeclaration(son, {
          document,
          currentScope: nextScope,
        })
      })
    }
  }

  private linkDefinition(node: AstNodeWithName, params: LinkerParams) {
    //1- Validar se o id do nó é um parâmetro da macro, através do escopo.
    const { document, currentScope } = params

    const localReference = currentScope.resolveLocalOnly(node.name)

    if (localReference && isParameter(localReference)) {
      // Se for parâmetro adiciona uma referencia a ele
      document.references.push(createReference(node, localReference))
    } else {
      // Se não for um parâmetro adiciona como uma referência a sí mesmo no array de references
      document.references.push(createReference(node, node))
    }
  }
}

function linkComponentAndInterface(
  element: Port | Action | Condition,
  document: SnclDocument,
  currentScope: Scope
) {
  const component = getReference(element.component, currentScope, ['Media', 'Context', 'Parameter'])

  // Realiza o link somente se o componente foi encontrado
  if (component === undefined) {
    return
  }

  element.component.$ref = component
  document.references.push(element.component)

  const componentScope = isMacro(currentScope.ownerNode)
    ? currentScope
    : document.symbolTable.getScopeFromNode(component)

  if (element.interface && componentScope) {
    let iface: InterfaceRefTypes | undefined
    if (component.$type === 'Context') {
      iface = getReference(element.interface, componentScope, ['Port', 'Parameter'], {
        localOnly: true,
      })
    } else if (component.$type === 'Media') {
      iface = getReference(element.interface, componentScope, ['Area', 'Property', 'Parameter'], {
        localOnly: true,
      })
    } else if (component.$type === 'Parameter') {
      iface = getReference(element.interface, componentScope, ['Parameter'], { localOnly: true })
    }

    element.interface.$ref = iface

    if (element.interface.$ref) {
      document.references.push(element.interface)
    }
  }
}

type GetReferenceOptions = {
  localOnly?: boolean
}
/**
 * Resolve uma referência na tabela de símbolos pelo nome e tipo do elemento.
 *
 * Busca o elemento referenciado por `ref.$name` na `symbolTable` e retorna
 * apenas se o `$type` do elemento estiver entre os `targetTypes` esperados.
 *
 * @param ref - Referência a ser resolvida.
 * @param symbolTable - Tabela de símbolos onde a referência será buscada.
 * @param targetTypes - Lista de tipos válidos que o elemento resolvido pode ter.
 * @returns O elemento resolvido ou `undefined` se não existir ou tiver tipo inválido.
 */
export function getReference<T extends AstNodeWithName, K extends T['$type']>(
  ref: Reference<T>,
  scope: Scope,
  targetTypes: Array<K>,
  options?: GetReferenceOptions
) {
  const target = options?.localOnly ? scope.resolveLocalOnly(ref.$name) : scope.resolve(ref.$name)

  if (!target) {
    return target
  }

  if ((targetTypes as readonly string[]).includes(target.$type)) {
    return target as Extract<T, { $type: K }>
  }

  return undefined
}

function createReference(origin: AstNodeWithName, reference: AstNodeWithName): Reference {
  return {
    $type: 'Reference',
    $name: origin.name,
    $ref: reference,
    location: origin.location,
    isVirtual: origin.isVirtual,
  }
}
