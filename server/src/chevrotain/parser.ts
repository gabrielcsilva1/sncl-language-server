import { CstParser } from 'chevrotain'
import { allTokens } from './tokens'
import { Identifier } from './tokens/generic'
import {
  Action,
  Area,
  Condition,
  ConditionSeparator,
  Context,
  Do,
  End,
  Macro,
  Media,
  Port,
  Region,
} from './tokens/keywords'
import { Value } from './tokens/literals'
import { Colon, Comma, Dot, LParen, RParen } from './tokens/symbols'

export class SnclParser extends CstParser {
  constructor() {
    super(allTokens, {
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
      { ALT: () => this.SUBRULE(this.context) },
      { ALT: () => this.SUBRULE(this.link) },
      { ALT: () => this.SUBRULE(this.macro) },
      { ALT: () => this.SUBRULE(this.macroCall) },
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
      this.OR([{ ALT: () => this.SUBRULE(this.area) }, { ALT: () => this.SUBRULE(this.property) }])
    })

    this.CONSUME(End)
  })

  private area = this.RULE('area', () => {
    this.CONSUME(Area)
    this.CONSUME(Identifier)

    this.MANY(() => this.SUBRULE(this.property))

    this.CONSUME(End)
  })

  private port = this.RULE('port', () => {
    this.CONSUME(Port)
    this.CONSUME1(Identifier)
    this.CONSUME2(Identifier)

    this.OPTION(() => {
      this.CONSUME(Dot)
      this.CONSUME3(Identifier)
    })
  })

  private context = this.RULE('context', () => {
    this.CONSUME(Context)
    this.CONSUME(Identifier)

    this.MANY(() => {
      this.OR([
        { ALT: () => this.SUBRULE(this.port) },
        { ALT: () => this.SUBRULE(this.media) },
        { ALT: () => this.SUBRULE(this.link) },
        { ALT: () => this.SUBRULE(this.context) },
      ])
    })

    this.CONSUME(End)
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
    this.CONSUME1(Identifier)

    this.OPTION(() => {
      this.CONSUME(Dot)
      this.CONSUME2(Identifier)
    })
  })

  private action = this.RULE('action', () => {
    this.CONSUME(Action)
    this.CONSUME1(Identifier)

    this.OPTION(() => {
      this.CONSUME(Dot)
      this.CONSUME2(Identifier)
    })

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

  private macro = this.RULE('macro', () => {
    this.CONSUME(Macro)
    this.CONSUME1(Identifier)

    this.CONSUME(LParen)

    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.CONSUME2(Identifier)
      },
    })

    this.CONSUME(RParen)

    this.MANY(() => {
      this.SUBRULE(this.macroDeclaration)
    })

    this.CONSUME(End)
  })

  private macroDeclaration = this.RULE('macroDeclaration', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.region) },
      { ALT: () => this.SUBRULE(this.media) },
      { ALT: () => this.SUBRULE(this.port) },
      { ALT: () => this.SUBRULE(this.context) },
      { ALT: () => this.SUBRULE(this.link) },
      { ALT: () => this.SUBRULE(this.macroCall) },
    ])
  })

  private macroCall = this.RULE('macroCall', () => {
    this.CONSUME(Identifier)

    this.CONSUME(LParen)

    this.MANY_SEP({
      SEP: Comma,
      DEF: () => {
        this.SUBRULE(this.value)
      },
    })

    this.CONSUME(RParen)
  })
}

export const sNCLParser = new SnclParser()
