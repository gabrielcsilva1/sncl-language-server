/**
 * @generated
 * ESTE ARQUIVO FOI GERADO AUTOMATICAMENTE.
 *
 * Gerado por: server/scripts/generate-cst-types.ts
 * Script: npm run gen:cst-types
 *
 * NÃO EDITE ESTE ARQUIVO MANUALMENTE.
 */

import type { CstNode, ICstVisitor, IToken } from 'chevrotain'

export interface ProgramCstNode extends CstNode {
  name: 'program'
  children: ProgramCstChildren
}

export type ProgramCstChildren = {
  declaration?: DeclarationCstNode[]
}

export interface DeclarationCstNode extends CstNode {
  name: 'declaration'
  children: DeclarationCstChildren
}

export type DeclarationCstChildren = {
  region?: RegionCstNode[]
  media?: MediaCstNode[]
  port?: PortCstNode[]
  context?: ContextCstNode[]
  link?: LinkCstNode[]
  macro?: MacroCstNode[]
  macroCall?: MacroCallCstNode[]
}

export interface RegionCstNode extends CstNode {
  name: 'region'
  children: RegionCstChildren
}

export type RegionCstChildren = {
  Region: IToken[]
  Identifier: IToken[]
  property?: PropertyCstNode[]
  region?: RegionCstNode[]
  End: IToken[]
}

export interface MediaCstNode extends CstNode {
  name: 'media'
  children: MediaCstChildren
}

export type MediaCstChildren = {
  Media: IToken[]
  Identifier: IToken[]
  area?: AreaCstNode[]
  property?: PropertyCstNode[]
  End: IToken[]
}

export interface AreaCstNode extends CstNode {
  name: 'area'
  children: AreaCstChildren
}

export type AreaCstChildren = {
  Area: IToken[]
  Identifier: IToken[]
  property?: PropertyCstNode[]
  End: IToken[]
}

export interface PortCstNode extends CstNode {
  name: 'port'
  children: PortCstChildren
}

export type PortCstChildren = {
  Port: IToken[]
  Identifier: IToken[]
  Dot?: IToken[]
}

export interface ContextCstNode extends CstNode {
  name: 'context'
  children: ContextCstChildren
}

export type ContextCstChildren = {
  Context: IToken[]
  Identifier: IToken[]
  port?: PortCstNode[]
  media?: MediaCstNode[]
  link?: LinkCstNode[]
  context?: ContextCstNode[]
  End: IToken[]
}

export interface LinkCstNode extends CstNode {
  name: 'link'
  children: LinkCstChildren
}

export type LinkCstChildren = {
  condition: ConditionCstNode[]
  ConditionSeparator?: IToken[]
  Do: IToken[]
  property?: PropertyCstNode[]
  action?: ActionCstNode[]
  End: IToken[]
}

export interface ConditionCstNode extends CstNode {
  name: 'condition'
  children: ConditionCstChildren
}

export type ConditionCstChildren = {
  Condition: IToken[]
  Identifier: IToken[]
  Dot?: IToken[]
}

export interface ActionCstNode extends CstNode {
  name: 'action'
  children: ActionCstChildren
}

export type ActionCstChildren = {
  Action: IToken[]
  Identifier: IToken[]
  Dot?: IToken[]
  property?: PropertyCstNode[]
  End: IToken[]
}

export interface PropertyCstNode extends CstNode {
  name: 'property'
  children: PropertyCstChildren
}

export type PropertyCstChildren = {
  Identifier: IToken[]
  Colon: IToken[]
  value: ValueCstNode[]
}

export interface ValueCstNode extends CstNode {
  name: 'value'
  children: ValueCstChildren
}

export type ValueCstChildren = {
  Value: IToken[]
}

export interface MacroCstNode extends CstNode {
  name: 'macro'
  children: MacroCstChildren
}

export type MacroCstChildren = {
  Macro: IToken[]
  Identifier: IToken[]
  LParen: IToken[]
  Comma?: IToken[]
  RParen: IToken[]
  macroDeclaration?: MacroDeclarationCstNode[]
  End: IToken[]
}

export interface MacroDeclarationCstNode extends CstNode {
  name: 'macroDeclaration'
  children: MacroDeclarationCstChildren
}

export type MacroDeclarationCstChildren = {
  region?: RegionCstNode[]
  media?: MediaCstNode[]
  port?: PortCstNode[]
  context?: ContextCstNode[]
  link?: LinkCstNode[]
  macroCall?: MacroCallCstNode[]
}

export interface MacroCallCstNode extends CstNode {
  name: 'macroCall'
  children: MacroCallCstChildren
}

export type MacroCallCstChildren = {
  Identifier: IToken[]
  LParen: IToken[]
  value?: ValueCstNode[]
  Comma?: IToken[]
  RParen: IToken[]
}

export interface ISnclNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  program(children: ProgramCstChildren, param?: IN): OUT
  declaration(children: DeclarationCstChildren, param?: IN): OUT
  region(children: RegionCstChildren, param?: IN): OUT
  media(children: MediaCstChildren, param?: IN): OUT
  area(children: AreaCstChildren, param?: IN): OUT
  port(children: PortCstChildren, param?: IN): OUT
  context(children: ContextCstChildren, param?: IN): OUT
  link(children: LinkCstChildren, param?: IN): OUT
  condition(children: ConditionCstChildren, param?: IN): OUT
  action(children: ActionCstChildren, param?: IN): OUT
  property(children: PropertyCstChildren, param?: IN): OUT
  value(children: ValueCstChildren, param?: IN): OUT
  macro(children: MacroCstChildren, param?: IN): OUT
  macroDeclaration(children: MacroDeclarationCstChildren, param?: IN): OUT
  macroCall(children: MacroCallCstChildren, param?: IN): OUT
}
