import type { Declaration } from '../@types/sncl-types'
import type { SymbolTable } from '../symbol-table'
import type { Reference } from '../syntax-tree'
import type { SnclDocument } from '../workspace/document'

export function link(document: SnclDocument): void {
  linkRecursive(document, document.parseResult.value)
}

function doLink<T extends DeclarationTypes>(
  ref: Reference,
  document: SnclDocument,
  targetTypes: T[]
) {
  const nodeRef = getReference(ref.$name, document.symbolTable, targetTypes)

  ref.$ref = nodeRef

  if (nodeRef) {
    document.references.push(ref)
  }
}

function linkRecursive(document: SnclDocument, declarations: Declaration[]) {
  for (const declaration of declarations) {
    if (declaration.$type === 'Media' && declaration.rg) {
      doLink(declaration.rg, document, ['Region'])
    } else if (declaration.$type === 'Port') {
      // O componente referenciado pode ser uma mídia ou um contexto.
      doLink(declaration.component, document, ['Media', 'Context'])

      // TODO: Realizar o link da propriedade interface
      // TODO: Verificar uma forma de fazer o link da interface quando o componente referenciar uma Media
    } else if (declaration.$type === 'Link') {
      // TODO: Realizar o link da propriedade interface para Conditions e Actions
      // TODO: Verificar uma forma de fazer o link da interface quando o componente referenciar uma Media

      // Conditions
      for (const bind of declaration.conditions) {
        doLink(bind.component, document, ['Media', 'Context'])
      }

      // Actions
      for (const bind of declaration.actions) {
        doLink(bind.component, document, ['Media', 'Context'])
      }
    } else if (declaration.$type === 'Context') {
      linkRecursive(document, declaration.children)
    } else if (declaration.$type === 'MacroCall') {
      doLink(declaration.macro, document, ['Macro'])
    } else if (declaration.$type === 'Macro') {
      const macroCalls = declaration.children.filter((d) => d.$type === 'MacroCall')
      linkRecursive(document, macroCalls)
    }
  }
}

/**
 * Representa todos os valores possíveis da propriedade $type
 * da união {@link Declaration}
 *
 * @example
 * // É o mesmo que fazer
 * type DeclarationType = 'Region' | 'Media' | 'Port'  ...
 */
type DeclarationTypes = Declaration['$type']

export function getReference<T extends DeclarationTypes>(
  elementId: string,
  symbolTable: SymbolTable,
  targetTypes: T[]
) {
  const target = symbolTable.getElement(elementId)

  if (target !== undefined && (targetTypes as readonly string[]).includes(target.$type)) {
    return target as Extract<Declaration, { $type: T }>
  }

  return undefined
}
