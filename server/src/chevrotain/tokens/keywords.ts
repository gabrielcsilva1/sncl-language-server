import { createToken } from 'chevrotain'
import { Identifier } from './generic'

export const End = createToken({
  name: 'End',
  pattern: /end(?!\s*:)/,
  longer_alt: Identifier,
})

export const Media = createToken({
  name: 'Media',
  pattern: /media/,
  longer_alt: Identifier,
})

export const Port = createToken({
  name: 'Port',
  pattern: /port/,
  longer_alt: Identifier,
})

export const Region = createToken({
  name: 'Region',
  pattern: /region/,
  longer_alt: Identifier,
})

export const Condition = createToken({
  name: 'Condition',
  pattern: /onBegin|onEnd|onSelection/,
  longer_alt: Identifier,
})

export const Action = createToken({
  name: 'Action',
  pattern: /start|stop|set|abort/,
  longer_alt: Identifier,
})

export const Do = createToken({
  name: 'Do',
  pattern: /do/,
  longer_alt: Identifier,
})

export const ConditionSeparator = createToken({
  name: 'ConditionSeparator',
  pattern: /AND|OR/,
  longer_alt: Identifier,
})
