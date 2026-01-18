import { createToken } from 'chevrotain'

export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
})

export const Dot = createToken({
  name: 'Dot',
  pattern: /\./,
})

export const Comma = createToken({
  name: 'Comma',
  pattern: /,/,
})

export const LParen = createToken({
  name: 'LParen',
  pattern: /\(/,
  label: '(',
})

export const RParen = createToken({
  name: 'RParen',
  pattern: /\)/,
  label: ')',
})
