import type { AstNode, Reference } from '../syntax-tree'

// O nó raiz programa, contém todas as declarações
export interface Program extends AstNode {
  $type: 'Program'
  declarations: Declaration[]
}

// União de todos os tipos de declaração possíveis
export type Declaration = Region | Media | Port

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
  media: Reference<Media>
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
