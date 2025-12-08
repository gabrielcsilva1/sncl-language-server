import type * as ast from '../@types/sncl-types'
import type {
  DeclarationCstChildren,
  ISnclNodeVisitor,
  MediaCstChildren,
  PortCstChildren,
  ProgramCstChildren,
  PropertyCstChildren,
  RegionCstChildren,
  ValueCstChildren,
} from '../chevrotain/generated/cst-types'
import type { Reference } from '../syntax-tree'
import { getLocationFromToken } from '../utils/utils'
import { sNCLParser } from './parser'

const BaseCstVisitor = sNCLParser.getBaseCstVisitorConstructor()

class SnclVisitor extends BaseCstVisitor implements ISnclNodeVisitor<void, unknown> {
  constructor() {
    super()
    this.validateVisitor()
  }

  program(children: ProgramCstChildren): Omit<ast.Program, 'location'> {
    const declarations = children.declaration?.map((decl) => this.visit(decl)) || []

    return {
      $type: 'Program',
      declarations,
    }
  }

  declaration(children: DeclarationCstChildren): ast.Declaration {
    if (children.region) {
      return this.visit(children.region)
    } else if (children.media) {
      return this.visit(children.media)
    } else if (children.port) {
      return this.visit(children.port)
    }

    throw new Error(
      `SnclVisitor.declaration possui uma declaração não implementada: ${children}`
    )
  }

  region(children: RegionCstChildren): ast.Region {
    const name = children.Identifier[0].image

    const properties = (children.property || []).map((prop) => this.visit(prop))

    return {
      $type: 'Region',
      name,
      properties,
      location: getLocationFromToken(children.Region[0], children.End[0]),
    }
  }

  media(children: MediaCstChildren): ast.Media {
    const name = children.Identifier[0].image
    const properties: ast.Property[] = []
    let rgRef: Reference<ast.Region> | undefined

    for (const property of children.property || []) {
      const node = this.visit(property) as ast.Property

      if (node.key === 'rg') {
        rgRef = {
          $type: 'Reference',
          $name: node.value.value,
          // O campo 'ref' será preenchido pelo Linker
          location: node.value.location,
        }
      } else {
        properties.push(node)
      }
    }

    return {
      $type: 'Media',
      name,
      rg: rgRef,
      properties,
      location: getLocationFromToken(children.Media[0], children.End[0]),
    }
  }

  port(children: PortCstChildren): ast.Port {
    const portName = children.Identifier[0].image
    const mediaName = children.Identifier[1].image

    return {
      $type: 'Port',
      name: portName,
      // O campo 'ref' será preenchido pelo Linker
      media: {
        $type: 'Reference',
        $name: mediaName,
        location: getLocationFromToken(children.Identifier[1]),
      },
      location: getLocationFromToken(children.Port[0], children.Identifier[1]),
    }
  }

  property(children: PropertyCstChildren): ast.Property {
    const key = children.Identifier[0].image
    const value = this.visit(children.value)

    return {
      $type: 'Property',
      key,
      value,
      location: getLocationFromToken(
        children.Identifier[0],
        children.value[0].children.Value[0]
      ),
    }
  }

  value(children: ValueCstChildren): ast.PropertyValue {
    return {
      $type: 'Value',
      value: children.Value[0].image,
      location: getLocationFromToken(children.Value[0]),
    }
  }
}

export const sNCLVisitor = new SnclVisitor()
