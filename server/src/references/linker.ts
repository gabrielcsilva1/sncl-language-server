import { SymbolTable } from '../symbol-table'
import type { SnclDocument } from '../workspace/document'

export interface ILinker {
  link(document: SnclDocument): void
}

export class Linker implements ILinker {
  link(document: SnclDocument): void {
    const symbolTable = SymbolTable.from(document.parseResult.value)

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
}
