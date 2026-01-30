import type { AstNode, Reference } from '../syntax-tree'

// O nó raiz programa, contém todas as declarações
export interface Program extends AstNode {
  $type: 'Program'
  declarations: Declaration[]
}

// União de todos os tipos de declaração possíveis
export type Declaration = Region | Media | Port | Link | Context | Macro | MacroCall

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
  children: Area[]
}

export interface Area extends AstNode {
  $type: 'Area'
  name: string
  properties: Property[]
}

export interface Port extends AstNode {
  $type: 'Port'
  name: string
  component: Reference<ComponentRefTypes>
  interface?: Reference<InterfaceRefTypes>
}

export interface Context extends AstNode {
  $type: 'Context'
  name: string
  children: Array<ContextBody>
}

export type ContextBody = Media | Port | Link | Context

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
  interface?: Reference<InterfaceRefTypes>
}

export interface Action extends AstNode {
  $type: 'Action'
  role: string
  component: Reference<Media | Context>
  interface?: Reference<InterfaceRefTypes>
  properties: Property[]
}

export interface Macro extends AstNode {
  $type: 'Macro'
  children: MacroDeclarations[]
  name: string
  parameters: string[]
}

export type MacroDeclarations = Region | Media | Port | Link | Context | MacroCall

export interface MacroCall extends AstNode {
  $type: 'MacroCall'
  $container?: Macro
  arguments: PropertyValue[]
  macro: Reference<Macro>
}

export interface Property extends AstNode {
  $type: 'Property'
  name: string
  $value: PropertyValue
}

// Tipos para os valores das propriedades
export interface PropertyValue extends AstNode {
  $type: 'Value'
  value: string
}

/**********************************************
 *          Union Types - Utilitários          *
 ***********************************************/

/**
 * Tipos que podem ser referenciados pelo campo `component` de
 * uma {@link Port}, {@link Action} ou {@link Condition}
 * */
export type ComponentRefTypes = Media | Context

/**
 * Tipos que podem ser referenciados pelo campo `interface` de
 * uma {@link Port}, {@link Action} ou {@link Condition}
 */
export type InterfaceRefTypes = Port | Property | Area
