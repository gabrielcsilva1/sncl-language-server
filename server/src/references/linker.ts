import type { Declaration } from '../@types/sncl-types'
import type { SymbolTable } from '../symbol-table'

export function link(declarations: Declaration[], symbolTable: SymbolTable): void {
  for (const declaration of declarations) {
    if (declaration.$type === 'Media' && declaration.rg) {
      declaration.rg.$ref = getReference(declaration.rg.$name, symbolTable, ['Region'])
    } else if (declaration.$type === 'Port') {
      // O componente referenciado pode ser uma mídia ou um contexto.
      declaration.component.$ref = getReference(declaration.component.$name, symbolTable, [
        'Media',
        'Context',
      ])

      // TODO: Realizar o link da propriedade interface
      // TODO: Verificar uma forma de fazer o link da interface quando o componente referenciar uma Media
    } else if (declaration.$type === 'Link') {
      // TODO: Realizar o link da propriedade interface para Conditions e Actions
      // TODO: Verificar uma forma de fazer o link da interface quando o componente referenciar uma Media

      // Conditions
      for (const bind of declaration.conditions) {
        bind.component.$ref = getReference(bind.component.$name, symbolTable, ['Media', 'Context'])
      }

      // Actions
      for (const bind of declaration.actions) {
        bind.component.$ref = getReference(bind.component.$name, symbolTable, ['Media', 'Context'])
      }
    } else if (declaration.$type === 'Context') {
      link(declaration.children, symbolTable)
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

function getReference<T extends DeclarationTypes>(
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
