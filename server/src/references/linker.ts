import type { Action, Condition, Declaration, Port } from '../@types/sncl-types'
import type { SymbolTable, SymbolTableElements } from '../symbol-table'
import type { AstNodeWithName, Reference } from '../syntax-tree'
import type { SnclDocument } from '../workspace/document'

export function link(document: SnclDocument): void {
  linkRecursive(document, document.parseResult.value)
}

function linkRecursive(document: SnclDocument, declarations: Declaration[]) {
  for (const declaration of declarations) {
    if (declaration.$type === 'Media' && declaration.rg) {
      declaration.rg.$ref = getReference(declaration.rg, document.symbolTable, ['Region'])

      if (declaration.rg.$ref) {
        document.references.push(declaration.rg)
      }
    } else if (declaration.$type === 'Port') {
      linkComponentAndInterface(declaration, document)
    } else if (declaration.$type === 'Link') {
      // Conditions
      for (const bind of declaration.conditions) {
        linkComponentAndInterface(bind, document)
      }

      // Actions
      for (const bind of declaration.actions) {
        linkComponentAndInterface(bind, document)
      }
    } else if (declaration.$type === 'Context') {
      linkRecursive(document, declaration.children)
    } else if (declaration.$type === 'MacroCall') {
      declaration.macro.$ref = getReference(declaration.macro, document.symbolTable, ['Macro'])

      if (declaration.macro.$ref) {
        document.references.push(declaration.macro)
      }
    } else if (declaration.$type === 'Macro') {
      const macroCalls = declaration.children.filter((d) => d.$type === 'MacroCall')
      linkRecursive(document, macroCalls)
    }
  }
}

function linkComponentAndInterface(element: Port | Action | Condition, document: SnclDocument) {
  const component = getReference(element.component, document.symbolTable, ['Media', 'Context'])

  if (component) {
    element.component.$ref = component
    document.references.push(element.component)
  }

  if (element.interface && component) {
    const targetType = component.$type === 'Context' ? 'Port' : 'Area'
    const iface = getReference(element.interface, document.symbolTable, [targetType])
    element.interface.$ref = iface

    if (!iface && component.$type === 'Media') {
      // Como iface pode não ser filho do component, faz a busca por property para não dar erro na fase de validação
      const property = component.properties.find((prop) => prop.name === element.interface?.$name)
      element.interface.$ref = property || iface
    }

    if (element.interface.$ref) {
      document.references.push(element.interface)
    }
  }
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
export function getReference<T extends AstNodeWithName>(
  ref: Reference<T>,
  symbolTable: SymbolTable,
  targetTypes: Array<T['$type']>
) {
  const target = symbolTable.getElement(ref.$name)

  if (!target) {
    return target
  }

  if ((targetTypes as readonly string[]).includes(target.$type)) {
    return target as Extract<SymbolTableElements, { $type: T['$type'] }>
  }

  return undefined
}
