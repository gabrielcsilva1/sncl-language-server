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
