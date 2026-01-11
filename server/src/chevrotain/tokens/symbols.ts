import { createToken } from 'chevrotain'

export const Colon = createToken({
  name: 'Colon',
  pattern: /:/,
})

export const Dot = createToken({
  name: 'Dot',
  pattern: /\./,
})
