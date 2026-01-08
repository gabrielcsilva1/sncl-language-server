import type * as ast from '../@types/sncl-types'
import type {
  ActionCstChildren,
  ConditionCstChildren,
  DeclarationCstChildren,
  ISnclNodeVisitor,
  LinkCstChildren,
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
    const declarations = (children.declaration || [])
      .map((decl) => this.visit(decl))
      .filter((decl) => decl !== undefined) // Pode ser undefined para declarações não implementadas

    return {
      $type: 'Program',
      declarations,
    }
  }

  declaration(children: DeclarationCstChildren): ast.Declaration | undefined {
    if (children.region) {
      return this.visit(children.region)
    } else if (children.media) {
      return this.visit(children.media)
    } else if (children.port) {
      return this.visit(children.port)
    } else if (children.link) {
      return this.visit(children.link)
    }

    return
  }

  region(children: RegionCstChildren): ast.Region {
    const name = children.Identifier[0].image

    const properties = (children.property || []).map((prop) => this.visit(prop))
    const regions = (children.region || []).map((region) => this.visit(region))

    return {
      $type: 'Region',
      name,
      children: regions,
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

  link(children: LinkCstChildren): ast.Link {
    const conditions = children.condition.map((condition) => this.visit(condition))
    const actions = children.action?.map((action) => this.visit(action)) || []
    const properties = children.property?.map((prop) => this.visit(prop)) || []

    return {
      $type: 'Link',
      conditions,
      actions,
      properties,
      location: getLocationFromToken(
        children.condition[0].children.Condition[0],
        children.End[0]
      ),
    }
  }

  condition(children: ConditionCstChildren): ast.Condition {
    const role = children.Condition[0].image
    const componentId = children.Identifier[0].image

    return {
      $type: 'Condition',
      role,
      component: {
        $type: 'Reference',
        $name: componentId,
        location: getLocationFromToken(children.Identifier[0]),
      },
      location: getLocationFromToken(children.Condition[0], children.Identifier[0]),
    }
  }

  action(children: ActionCstChildren): ast.Action {
    const role = children.Action[0].image
    const componentId = children.Identifier[0].image
    const properties = (children.property || []).map((prop) => this.visit(prop))

    return {
      $type: 'Action',
      role,
      properties,
      component: {
        $type: 'Reference',
        $name: componentId,
        location: getLocationFromToken(children.Identifier[0]),
      },
      location: getLocationFromToken(children.Action[0], children.End[0]),
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
