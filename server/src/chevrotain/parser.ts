import { CstParser } from 'chevrotain'
import { allTokens } from './tokens'
import { Identifier } from './tokens/generic'
import {
  Action,
  Condition,
  ConditionSeparator,
  Do,
  End,
  Media,
  Port,
  Region,
} from './tokens/keywords'
import { Value } from './tokens/literals'
import { Colon } from './tokens/symbols'

export class SnclParser extends CstParser {
  constructor() {
    super(allTokens, {
      nodeLocationTracking: 'onlyOffset',
      maxLookahead: 1,
    })

    this.performSelfAnalysis()
  }

  public program = this.RULE('program', () => {
    this.MANY(() => {
      this.SUBRULE(this.declaration)
    })
  })

  public declaration = this.RULE('declaration', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.region) },
      { ALT: () => this.SUBRULE(this.media) },
      { ALT: () => this.SUBRULE(this.port) },
      { ALT: () => this.SUBRULE(this.link) },
    ])
  })

  private region = this.RULE('region', () => {
    this.CONSUME(Region)
    this.CONSUME(Identifier)

    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.property) },
        { ALT: () => this.SUBRULE(this.region) },
      ])
    })

    this.CONSUME(End)
  })

  private media = this.RULE('media', () => {
    this.CONSUME(Media)
    this.CONSUME(Identifier)

    this.MANY(() => {
      this.SUBRULE(this.property)
    })

    this.CONSUME(End)
  })

  private port = this.RULE('port', () => {
    this.CONSUME(Port)
    this.CONSUME1(Identifier)
    this.CONSUME2(Identifier)
  })

  private link = this.RULE('link', () => {
    this.AT_LEAST_ONE_SEP({
      SEP: ConditionSeparator,
      DEF: () => {
        this.SUBRULE(this.condition)
      },
    })

    this.CONSUME(Do)

    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.property) },
        { ALT: () => this.SUBRULE(this.action) },
      ])
    })

    this.CONSUME(End)
  })

  private condition = this.RULE('condition', () => {
    this.CONSUME(Condition)
    this.CONSUME(Identifier)
  })

  private action = this.RULE('action', () => {
    this.CONSUME(Action)
    this.CONSUME(Identifier)

    this.MANY(() => {
      this.SUBRULE(this.property)
    })

    this.CONSUME(End)
  })

  private property = this.RULE('property', () => {
    this.CONSUME(Identifier)
    this.CONSUME(Colon)
    this.SUBRULE(this.value)
  })

  private value = this.RULE('value', () => {
    this.CONSUME(Value)
  })
}

export const sNCLParser = new SnclParser()
