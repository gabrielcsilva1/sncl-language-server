import type * as ast from '../@types/sncl-types'
import { identifierPatternExact } from '../chevrotain/tokens/generic'
import type { ValidationError } from '../parser/parser'
import type { SnclDocument } from '../workspace/document'

export interface IDocumentValidator {
  validate(document: SnclDocument): void
}

export class DocumentValidator implements IDocumentValidator {
  validate(document: SnclDocument): void {
    const errors: ValidationError[] = []

    errors.push(...this.validateDuplicates(document.parseResult.value))
    errors.push(...this.validateDeclaration(document))

    document.parseResult.parseErrors.push(...errors)
  }

  private validateDuplicates(program: ast.Program): ValidationError[] {
    const errors: ValidationError[] = []

    const declaredElements = new Map<string, ast.Declaration>()

    for (const declaration of program.declarations) {
      if (declaredElements.has(declaration.name)) {
        errors.push({
          message: `Duplicated identifier: ${declaration.name}`,
          location: declaration.location,
        })
      } else {
        declaredElements.set(declaration.name, declaration)
      }
    }

    return errors
  }

  private validateDeclaration(document: SnclDocument): ValidationError[] {
    const errors: ValidationError[] = []

    for (const declaration of document.parseResult.value.declarations) {
      if (declaration.$type === 'Media') {
        errors.push(...validate.Media(declaration))
      } else if (declaration.$type === 'Port') {
        errors.push(...validate.Port(declaration))
      }
    }
    return errors
  }
}

const validate = {
  Media: (media: ast.Media) => {
    const errors: ValidationError[] = []

    if (media.rg) {
      const isIdentifier = identifierPatternExact.test(media.rg.$name)
      const referenceFound = Boolean(media.rg.$ref)

      if (!isIdentifier) {
        errors.push({
          message: `The 'rg' property must reference a region identifier.`,
          location: media.rg.location,
        })
      } else if (!referenceFound) {
        errors.push({
          message: `Reference to undefined region: '${media.rg.$name}'.`,
          location: media.rg.location,
        })
      }
    }

    return errors
  },

  Port: (port: ast.Port) => {
    const errors: ValidationError[] = []

    if (!port.media.$ref) {
      errors.push({
        message: `Reference to undefined media: '${port.media.$name}'.`,
        location: port.media.location,
      })
    }

    return errors
  },
}
