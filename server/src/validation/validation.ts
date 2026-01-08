import type * as ast from '../@types/sncl-types'
import { identifierPatternExact } from '../chevrotain/tokens/generic'
import type { ValidationError } from '../parser/parser'
import type { SnclDocument } from '../workspace/document'

export function validateDocument(document: SnclDocument): void {
  const errors: ValidationError[] = []

  errors.push(...document.symbolTable.duplicateErrors)
  errors.push(...validateDeclaration(document))

  document.parseResult.errors.push(...errors)
}

function validateDeclaration(document: SnclDocument): ValidationError[] {
  const errors: ValidationError[] = []

  for (const declaration of document.parseResult.value.declarations) {
    if (declaration.$type === 'Media') {
      errors.push(...validate.Media(declaration))
    } else if (declaration.$type === 'Port') {
      errors.push(...validate.Port(declaration))
    } else if (declaration.$type === 'Link') {
      errors.push(...validate.Link(declaration))
    }
  }
  return errors
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

  Link: (link: ast.Link) => {
    const errors: ValidationError[] = []

    for (const bind of link.conditions) {
      if (bind.component.$ref === undefined) {
        errors.push({
          message: `Reference to undefined media: '${bind.component.$name}'.`,
          location: bind.component.location,
        })
      }
    }

    for (const bind of link.actions) {
      if (bind.component.$ref === undefined) {
        errors.push({
          message: `Reference to undefined media: '${bind.component.$name}'.`,
          location: bind.component.location,
        })
      }
    }

    return errors
  },
}
