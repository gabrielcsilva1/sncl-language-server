import type { IToken } from 'chevrotain'
import type {
  Action,
  Area,
  Condition,
  Context,
  Declaration,
  Link,
  Macro,
  MacroCall,
  Media,
  Parameter,
  Port,
  Property,
  PropertyValue,
} from '../@types/sncl-types'
import type { AstNode, AstNodeWithName, Location, Reference } from '../syntax-tree'

/**
 * Cria um objeto do tipo {@link Parameter}.
 * @param token - Token que vai ser extraído as informações do id e localização do parâmetro
 */

export function makeParameter(token: IToken): Parameter {
  return {
    $type: 'Parameter',
    name: token.image,
    // O campo $ref é preenchido pelo Linker
    location: getLocationFromToken(token),
  }
}

/**
 * Cria um objeto do tipo {@link Reference}.
 * @template T - Tipo do nó, no qual a referência é feita.
 * @param token - Token que vai ser extraído as informações do id e localização da referência
 */

export function makeReference<T extends AstNodeWithName>(token: IToken): Reference<T> {
  return {
    $type: 'Reference',
    $name: token.image,
    // O campo $ref é preenchido pelo Linker
    location: getLocationFromToken(token),
  }
}

export function getLocationFromToken(startNode: IToken, endNode?: IToken): Location {
  endNode = endNode ?? startNode

  return {
    startOffset: startNode.startOffset,
    endOffset: endNode.startOffset + endNode.image.length,
  }
}

export function isDeclaration(node?: AstNode): node is Declaration {
  return node?.$type === 'Declaration'
}

export function isMedia(node?: AstNode): node is Media {
  return node?.$type === 'Media'
}

export function isArea(node?: AstNode): node is Area {
  return node?.$type === 'Area'
}

export function isPort(node?: AstNode): node is Port {
  return node?.$type === 'Port'
}

export function isLink(node?: AstNode): node is Link {
  return node?.$type === 'Link'
}

export function isCondition(node?: AstNode): node is Condition {
  return node?.$type === 'Condition'
}

export function isAction(node?: AstNode): node is Action {
  return node?.$type === 'Action'
}

export function isContext(node?: AstNode): node is Context {
  return node?.$type === 'Context'
}

export function isParameter(node?: AstNode): node is Parameter {
  return node?.$type === 'Parameter'
}

export function isProperty(node?: AstNode): node is Property {
  return node?.$type === 'Property'
}

export function isPropertyValue(node?: AstNode): node is PropertyValue {
  return node?.$type === 'PropertyValue'
}

export function isMacro(node?: AstNode): node is Macro {
  return node?.$type === 'Macro'
}

export function isMacroCall(node?: AstNode): node is MacroCall {
  return node?.$type === 'MacroCall'
}
