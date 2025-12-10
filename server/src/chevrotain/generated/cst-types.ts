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

export interface ISnclNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  program(children: ProgramCstChildren, param?: IN): OUT
  declaration(children: DeclarationCstChildren, param?: IN): OUT
  region(children: RegionCstChildren, param?: IN): OUT
  media(children: MediaCstChildren, param?: IN): OUT
  port(children: PortCstChildren, param?: IN): OUT
  property(children: PropertyCstChildren, param?: IN): OUT
  value(children: ValueCstChildren, param?: IN): OUT
}
