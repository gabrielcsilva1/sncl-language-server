import type * as ast from '../@types/sncl-types'
import type {
  ActionCstChildren,
  AreaCstChildren,
  ConditionCstChildren,
  ContextCstChildren,
  DeclarationCstChildren,
  ISnclNodeVisitor,
  LinkCstChildren,
  MacroCallCstChildren,
  MacroCstChildren,
  MacroDeclarationCstChildren,
  MediaCstChildren,
  PortCstChildren,
  ProgramCstChildren,
  PropertyCstChildren,
  RegionCstChildren,
  ValueCstChildren,
} from '../chevrotain/generated/cst-types'
import type { Reference } from '../syntax-tree'
import { getLocationFromToken, makeReference } from '../utils/utils'
import { sNCLParser } from './parser'

const BaseCstVisitor = sNCLParser.getBaseCstVisitorConstructor()

class SnclVisitor extends BaseCstVisitor implements ISnclNodeVisitor<void, unknown> {
  constructor() {
    super()
    this.validateVisitor()
  }

  program(children: ProgramCstChildren): ast.Program {
    const declarations = (children.declaration || [])
      .map((decl) => this.visit(decl))
      .filter((decl) => decl !== undefined) as ast.Declaration[] // Pode ser undefined para declarações não implementadas

    const endOffset = declarations.at(-1)?.location.endOffset ?? 0

    return {
      $type: 'Program',
      declarations,
      location: {
        startOffset: 0,
        endOffset: endOffset,
      },
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
    } else if (children.context) {
      return this.visit(children.context)
    } else if (children.macro) {
      return this.visit(children.macro)
    } else if (children.macroCall) {
      return this.visit(children.macroCall)
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
      location: getLocationFromToken(children.Identifier[0]),
    }
  }

  media(children: MediaCstChildren): ast.Media {
    const name = children.Identifier[0].image
    const properties: ast.Property[] = []
    let rgRef: Reference<ast.Region> | undefined

    const areas = children.area?.map((area) => this.visit(area)) || []

    for (const property of children.property || []) {
      const node = this.visit(property) as ast.Property

      if (node.key === 'rg') {
        rgRef = {
          $type: 'Reference',
          $name: node.$value.value,
          // O campo 'ref' será preenchido pelo Linker
          location: node.$value.location,
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
      children: areas,
      location: getLocationFromToken(children.Identifier[0]),
    }
  }

  area(children: AreaCstChildren): ast.Area {
    const id = children.Identifier[0].image

    const properties = children.property?.map((prop) => this.visit(prop)) || []

    return {
      $type: 'Area',
      name: id,
      properties: properties,
      location: getLocationFromToken(children.Identifier[0]),
    }
  }

  port(children: PortCstChildren): ast.Port {
    const portId = children.Identifier[0].image
    const componentRef = makeReference<ast.ComponentRefTypes>(children.Identifier[1])

    const iface = children.Dot && makeReference<ast.InterfaceRefTypes>(children.Identifier[2])

    return {
      $type: 'Port',
      name: portId,
      // O campo 'ref' será preenchido pelo Linker
      component: componentRef,
      interface: iface,
      location: getLocationFromToken(children.Identifier[0]),
    }
  }

  context(children: ContextCstChildren): ast.Context {
    const element: ast.Context = {
      $type: 'Context',
      children: [],
      name: '',
      location: getLocationFromToken(children.Identifier[0]),
    }

    element.name = children.Identifier[0].image

    const ports = children.port?.map((port) => this.visit(port)) || []
    const medias = children.media?.map((media) => this.visit(media)) || []
    const contexts = children.context?.map((context) => this.visit(context)) || []
    const links = children.link?.map((link) => this.visit(link)) || []

    element.children = [...ports, ...medias, ...contexts, ...links]

    element.children.forEach((son) => {
      son.$container = element
    })

    return element
  }

  link(children: LinkCstChildren): ast.Link {
    const element: ast.Link = {
      $type: 'Link',
      actions: [],
      conditions: [],
      properties: [],
      location: getLocationFromToken(children.condition[0].children.Condition[0]),
    }

    element.conditions = children.condition.map((condition) => this.visit(condition))
    element.actions = children.action?.map((action) => this.visit(action)) || []
    element.properties = children.property?.map((prop) => this.visit(prop)) || []

    element.conditions.forEach((condition) => {
      condition.$container = element
    })

    element.actions.forEach((action) => {
      action.$container = element
    })

    return element
  }

  condition(children: ConditionCstChildren): ast.Condition {
    const role = children.Condition[0].image
    const componentRef = makeReference<ast.ComponentRefTypes>(children.Identifier[0])

    const iface = children.Dot && makeReference<ast.InterfaceRefTypes>(children.Identifier[1])

    return {
      $type: 'Condition',
      role,
      component: componentRef,
      interface: iface,
      location: getLocationFromToken(children.Condition[0], children.Identifier[0]),
    }
  }

  action(children: ActionCstChildren): ast.Action {
    const role = children.Action[0].image
    const componentRef = makeReference<ast.ComponentRefTypes>(children.Identifier[0])
    const properties = (children.property || []).map((prop) => this.visit(prop))

    const iface = children.Dot && makeReference<ast.Port>(children.Identifier[2])

    return {
      $type: 'Action',
      role,
      properties,
      component: componentRef,
      interface: iface,
      location: getLocationFromToken(children.Action[0], children.End[0]),
    }
  }

  property(children: PropertyCstChildren): ast.Property {
    const key = children.Identifier[0].image
    const value = this.visit(children.value)

    return {
      $type: 'Property',
      key,
      $value: value,
      location: getLocationFromToken(children.Identifier[0]),
    }
  }

  value(children: ValueCstChildren): ast.PropertyValue {
    return {
      $type: 'Value',
      value: children.Value[0].image,
      location: getLocationFromToken(children.Value[0]),
    }
  }

  macro(children: MacroCstChildren): ast.Macro {
    const element: ast.Macro = {
      $type: 'Macro',
      name: children.Identifier[0].image,
      children: [],
      parameters: [],
      location: getLocationFromToken(children.Identifier[0]),
    }

    element.parameters = children.Identifier.slice(1).map((token) => token.image)

    const macroDeclarations = (children.macroDeclaration || [])
      .map((decl) => this.visit(decl))
      .filter((decl) => decl !== undefined) // Pode ser undefined para declarações não implementadas

    element.children = macroDeclarations

    return element
  }

  macroDeclaration(children: MacroDeclarationCstChildren): unknown {
    if (children.region) {
      return this.visit(children.region)
    } else if (children.media) {
      return this.visit(children.media)
    } else if (children.port) {
      return this.visit(children.port)
    } else if (children.link) {
      return this.visit(children.link)
    } else if (children.context) {
      return this.visit(children.context)
    } else if (children.macroCall) {
      return this.visit(children.macroCall)
    }

    return
  }

  macroCall(children: MacroCallCstChildren): ast.MacroCall {
    const args = children.value?.map((value) => this.visit(value)) || []

    return {
      $type: 'MacroCall',
      arguments: args,
      macro: makeReference(children.Identifier[0]),
      location: getLocationFromToken(children.Identifier[0], children.RParen[0]),
    }
  }
}

export const sNCLVisitor = new SnclVisitor()
