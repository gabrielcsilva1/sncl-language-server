import type { AstNode, Reference } from '../syntax-tree'

// O nó raiz programa, contém todas as declarações
export interface Program extends AstNode {
  $type: 'Program'
  declarations: Declaration[]
}

// União de todos os tipos de declaração possíveis
export type Declaration = Region | Media | Port | Link | Context

export interface Region extends AstNode {
  $type: 'Region'
  name: string
  children: Region[]
  properties: Property[]
}

export interface Media extends AstNode {
  $type: 'Media'
  name: string
  rg?: Reference<Region>
  properties: Property[]
}

export interface Port extends AstNode {
  $type: 'Port'
  name: string
  component: Reference<Media | Context>
  interface?: Reference<Port>
}

export interface Context extends AstNode {
  $type: 'Context'
  name: string
  children: Array<Media | Port | Link | Context>
}

export interface Link extends AstNode {
  $type: 'Link'
  conditions: Condition[]
  actions: Action[]
  properties: Property[]
}

export interface Condition extends AstNode {
  $type: 'Condition'
  role: string
  component: Reference<Media | Context>
  interface?: Reference<Port>
}

export interface Action extends AstNode {
  $type: 'Action'
  role: string
  component: Reference<Media | Context>
  interface?: Reference<Port>
  properties: Property[]
}

export interface Property extends AstNode {
  $type: 'Property'
  key: string
  value: PropertyValue
}

// Tipos para os valores das propriedades
export interface PropertyValue extends AstNode {
  $type: 'Value'
  value: string
}
