import { type Either, left, right } from '../@types/either'
import type * as ast from '../@types/sncl-types'
import { identifierPatternExact } from '../chevrotain/tokens/generic'
import type { ValidationError } from '../parser/parser'
import type { SnclDocument } from '../workspace/document'

export function validateDocument(document: SnclDocument): void {
  const errors: ValidationError[] = []

  errors.push(...document.symbolTable.duplicateErrors)
  errors.push(...validateDeclaration(document.parseResult.value))

  document.parseResult.errors.push(...errors)
}

function validateDeclaration(declarations: ast.Declaration[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const declaration of declarations) {
    if (declaration.$type === 'Media') {
      errors.push(...validate.Media(declaration))
    } else if (declaration.$type === 'Port') {
      errors.push(...validate.Port(declaration))
    } else if (declaration.$type === 'Link') {
      errors.push(...validate.Link(declaration))
    } else if (declaration.$type === 'Context') {
      errors.push(...validateDeclaration(declaration.children))
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

    const result = validateComponentReference(port)

    if (result.isLeft()) {
      errors.push(result.value)
    }

    return errors
  },

  Link: (link: ast.Link) => {
    const errors: ValidationError[] = []

    for (const bind of link.conditions) {
      const result = validateComponentReference(bind)

      if (result.isLeft()) {
        errors.push(result.value)
      }
    }

    for (const bind of link.actions) {
      const result = validateComponentReference(bind)

      if (result.isLeft()) {
        errors.push(result.value)
      }
    }

    return errors
  },
}

function validateComponentReference(
  element: ast.Port | ast.Action | ast.Condition
): Either<ValidationError, null> {
  if (element.component.$ref === undefined) {
    return left({
      message: `Reference to undefined media or context: '${element.component.$name}'.`,
      location: element.component.location,
    })
  }

  const node = element.$type === 'Port' ? element : (element.$container as ast.Link)

  if (!isInSameContext(node, element.component.$ref)) {
    return left({
      message: `Component ${element.component.$name} and element ${node.$type} are not within the same context.`,
      location: element.component.location,
    })
  }

  // TODO: Validar interface. Primeiro deve resolver o link.

  return right(null)
}

function isInSameContext(element1: ast.Declaration, element2: ast.Declaration): boolean {
  if (element1.$container === undefined || element2.$container === undefined) {
    return element1.$container === element2.$container
  }

  if (element1.$container.$type !== 'Context' || element2.$container.$type !== 'Context') {
    return false
  }

  const fatherEl1 = element1.$container as ast.Context
  const fatherEl2 = element2.$container as ast.Context

  return fatherEl1.name === fatherEl2.name
}
