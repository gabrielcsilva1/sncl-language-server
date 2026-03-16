import type {
  Action,
  Condition,
  Context,
  Declaration,
  Link,
  Media,
  Port,
} from '../@types/sncl-types'
import { identifierPatternExact } from '../chevrotain/tokens/generic'
import type { AstNode } from '../syntax-tree'
import { isContext } from '../utils/ast-utils'
import type { SnclDocument } from '../workspace/document'

export function validateDocument(document: SnclDocument): void {
  const validator = new SnclValidator()

  validator.validate(document)

  document.parseResult.errors.push(...document.symbolTable.duplicateErrors)
}

interface ValidatorParams {
  document: SnclDocument
}

abstract class ValidatorBase {
  public validate(document: SnclDocument) {
    for (const declaration of document.parseResult.value) {
      this.declaration(declaration, { document })
    }
  }
  protected abstract declaration(node: Declaration, params: ValidatorParams): void
  protected abstract media(node: Media, params: ValidatorParams): void
  protected abstract port(node: Port, params: ValidatorParams): void
  protected abstract link(node: Link, params: ValidatorParams): void
  protected abstract context(node: Context, params: ValidatorParams): void
}

class SnclValidator extends ValidatorBase {
  protected declaration(node: Declaration, params: ValidatorParams): void {
    if (node.$type === 'Media') {
      this.media(node, params)
    } else if (node.$type === 'Port') {
      this.port(node, params)
    } else if (node.$type === 'Link') {
      this.link(node, params)
    } else if (node.$type === 'Context') {
      this.context(node, params)
    }
  }

  protected media(node: Media, params: ValidatorParams): void {
    const { document } = params
    const media = node

    if (media.rg) {
      // 1- O valor deve seguir o pattern do Identifier
      const isIdentifier = identifierPatternExact.test(media.rg.$name)

      // 2- A referência a region deve ter sido resolvida pelo link
      const referenceFound = Boolean(media.rg.$ref)

      if (!isIdentifier) {
        document.parseResult.errors.push({
          message: `The 'rg' property must reference a region identifier.`,
          location: media.rg.location,
        })
      } else if (!referenceFound) {
        document.parseResult.errors.push({
          message: `Reference to undefined region: '${media.rg.$name}'.`,
          location: media.rg.location,
        })
      }
    }
  }

  protected port(node: Port, params: ValidatorParams): void {
    this.validateComponentAndInterface(node, params)
  }

  protected link(node: Link, params: ValidatorParams): void {
    // 1- Valida Conditions
    for (const bind of node.conditions) {
      this.validateComponentAndInterface(bind, params)
    }

    // 2- Valida Actions
    for (const bind of node.actions) {
      this.validateComponentAndInterface(bind, params)
    }
  }

  protected context(node: Context, params: ValidatorParams): void {
    for (const son of node.children) {
      this.declaration(son, params)
    }
  }

  private validateComponentAndInterface(
    element: Port | Action | Condition,
    params: ValidatorParams
  ) {
    const { document } = params

    // 1- Referencia do componente deve ter sido resolvida pelo Linker
    if (element.component.$ref === undefined) {
      document.parseResult.errors.push({
        message: `Reference to undefined media or context: '${element.component.$name}'.`,
        location: element.component.location,
      })
    } else {
      // 2- Caso tenha sido encontrada, validar se a referência se encontra no mesmo contexto que o elemento
      let node: Port | Link

      if (element.$type === 'Action' || element.$type === 'Condition') {
        node = element.$container as Link
      } else {
        node = element
      }

      if (!isInSameContext(node, element.component.$ref)) {
        document.parseResult.errors.push({
          message: `Component '${element.component.$name}' is not in the same context.`,
          location: element.component.location,
        })
      }
    }

    // 3- Referencia da interface deve ter sido resolvida pelo Linker
    if (element.interface && element.interface.$ref === undefined) {
      document.parseResult.errors.push({
        message: `Reference to undefined interface: '${element.interface.$name}'.`,
        location: element.interface.location,
      })
    }
  }
}

function isInSameContext(element1: AstNode, element2: AstNode): boolean {
  if (element1.$container === undefined || element2.$container === undefined) {
    return element1.$container === element2.$container
  }

  if (isContext(element1.$container) && isContext(element2.$container)) {
    return element1.$container.name === element2.$container.name
  }

  return false
}
