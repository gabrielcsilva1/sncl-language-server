import type { Declaration } from '../@types/sncl-types'
import type { SymbolTable } from '../symbol-table'
import type { SnclDocument } from '../workspace/document'

export function link(document: SnclDocument): void {
  const symbolTable = document.symbolTable

  const program = document.parseResult.value

  for (const declaration of program.declarations) {
    if (declaration.$type === 'Media' && declaration.rg) {
      declaration.rg.$ref = getReference(declaration.rg.$name, symbolTable, ['Region'])
    } else if (declaration.$type === 'Port') {
      declaration.media.$ref = getReference(declaration.media.$name, symbolTable, ['Media'])
    } else if (declaration.$type === 'Link') {
      // Conditions
      for (const bind of declaration.conditions) {
        bind.component.$ref = getReference(bind.component.$name, symbolTable, ['Media'])
      }

      // Actions
      for (const bind of declaration.actions) {
        bind.component.$ref = getReference(bind.component.$name, symbolTable, ['Media'])
      }
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
type DeclarationType = Declaration['$type']

function getReference<T extends DeclarationType>(
  name: string,
  symbolTable: SymbolTable,
  targetTypes: T[]
) {
  const target = symbolTable.getElement(name)

  if (target !== undefined && (targetTypes as readonly string[]).includes(target.$type)) {
    return target as Extract<Declaration, { $type: T }>
  }

  return undefined
}
