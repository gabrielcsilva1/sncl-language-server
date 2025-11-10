import type { IToken } from 'chevrotain'
import type { Location } from '../syntax-tree'

export function getLocationFromToken(startNode: IToken, endNode?: IToken): Location {
  endNode = endNode ?? startNode

  return {
    startOffset: startNode.startOffset,
    endOffset: endNode.startOffset + endNode.image.length,
  }
}
