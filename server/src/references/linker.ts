import { SymbolTable } from '../symbol-table'
import type { SnclDocument } from '../workspace/document'

export function link(document: SnclDocument): void {
  const symbolTable = document.symbolTable

  const program = document.parseResult.value

  for (const declaration of program.declarations) {
    if (declaration.$type === 'Media' && declaration.rg) {
      const targetRegion = symbolTable.getElement(declaration.rg.$name)

      if (targetRegion && targetRegion.$type === 'Region') {
        declaration.rg.$ref = targetRegion
      }
    } else if (declaration.$type === 'Port') {
      const targetMedia = symbolTable.getElement(declaration.media.$name)

      if (targetMedia && targetMedia.$type === 'Media') {
        declaration.media.$ref = targetMedia
      }
    }
  }
}
