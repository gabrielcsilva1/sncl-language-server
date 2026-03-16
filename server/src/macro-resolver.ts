import { type Either, left, right } from './@types/either'
import type {
  Action,
  Area,
  Condition,
  Context,
  ContextBody,
  Declaration,
  Link,
  Macro,
  MacroCall,
  Media,
  Port,
  Region,
} from './@types/sncl-types'
import type { ParseResult, ValidationError } from './parser/parser'
import type { AstNodeWithName, Location, Reference } from './syntax-tree'
import { isMacro } from './utils/ast-utils'
import { isStringLiteral, removeQuotes } from './utils/utils'

/**
 * Se o valor passado for um parâmetro da Macro, retorna o seu respectivo valor,
 * caso contrário retorna a própria string.
 */
function validValue(value: string, stack: MacroStack) {
  if (stack.parameters.get(value)) {
    return stack.parameters.get(value) as string
  }

  return value
}

/**
 * Se o nome ($name) da referência for um parâmetro da Macro, retorna o seu respectivo valor,
 * caso contrário retorna a própria string.
 */
function validRef<T extends AstNodeWithName>(
  reference: Reference<T>,
  stack: MacroStack
): Reference<T> {
  return {
    ...reference,
    $name: validValue(reference.$name, stack),
    location: stack.rootCallLocation,
    isVirtual: true,
  }
}

function resolvePort(port: Port, stack: MacroStack): Port {
  const newElement: Port = {
    ...port,
    name: validValue(port.name, stack),
    component: validRef(port.component, stack),
    location: stack.rootCallLocation,
    isVirtual: true,
  }

  if (port.interface !== undefined) {
    port.interface = validRef(port.interface, stack)
  }

  return newElement
}

function resolveArea(area: Area, stack: MacroStack): Area {
  const newElement: Area = {
    ...area,
    name: validValue(area.name, stack),
    location: stack.rootCallLocation,
    isVirtual: true,
  }

  return newElement
}

function resolveMedia(media: Media, stack: MacroStack): Media {
  const newElement: Media = {
    ...media,
    name: validValue(media.name, stack),
    children: [],
    location: stack.rootCallLocation,
    isVirtual: true,
  }

  if (media.rg !== undefined) {
    newElement.rg = validRef(media.rg, stack)
  }

  for (const area of media.children) {
    newElement.children.push(resolveArea(area, stack))
    area.$container = newElement
  }

  return newElement
}

function resolveRegion(region: Region, stack: MacroStack): Region {
  const newElement: Region = {
    ...region,
    name: validValue(region.name, stack),
    children: [],
    location: stack.rootCallLocation,
    isVirtual: true,
  }

  for (const son of region.children) {
    newElement.children.push(resolveRegion(son, stack))
  }

  return newElement
}

function resolveBind(bind: Action | Condition, stack: MacroStack) {
  const newElement: Action | Condition = {
    ...bind,
    component: validRef(bind.component, stack),
    isVirtual: true,
  }

  if (bind.interface !== undefined) {
    newElement.interface = validRef(bind.interface, stack)
  }

  return newElement
}

function resolveLink(link: Link, stack: MacroStack): Link {
  const newElement: Link = {
    ...link,
    actions: [],
    conditions: [],
    isVirtual: true,
  }

  for (const condition of link.conditions) {
    const son = resolveBind(condition, stack) as Condition
    son.$container = newElement
    newElement.conditions.push(son)
  }

  for (const action of link.actions) {
    const son = resolveBind(action, stack) as Action
    son.$container = newElement
    newElement.actions.push(son)
  }

  return newElement
}

function resolveContext(context: Context, stack: MacroStack): Context {
  const newElement: Context = {
    ...context,
    name: validValue(context.name, stack),
    children: [],
    location: stack.rootCallLocation,
    isVirtual: true,
  }

  for (const son of context.children) {
    newElement.children.push(resolveContextBody(son, stack))
  }

  return newElement
}

function resolveContextBody(element: ContextBody, stack: MacroStack) {
  if (element.$type === 'Media') {
    return resolveMedia(element, stack)
  }
  if (element.$type === 'Port') {
    return resolvePort(element, stack)
  }
  if (element.$type === 'Context') {
    return resolveContext(element, stack)
  }

  return resolveLink(element, stack)
}

/**
 * Resolve as declarações dentro do corpo da Macro.
 */
function resolveMacroBody(
  macroCall: MacroCall,
  stack: Array<MacroStack>,
  parseResult: ParseResult<Declaration[]>
): Either<ValidationError, Declaration[]> {
  const macro = parseResult.value.find(
    (decl) => isMacro(decl) && decl.name === macroCall.macro.$name
  ) as Macro
  const rootCallLocation: Location = stack.at(0)?.rootCallLocation ?? macroCall.location

  const parameters: Map<string, string> = new Map()

  let index = 0
  for (const param of macro.parameters) {
    const value = removeQuotes(macroCall.arguments[index].name)
    parameters.set(param.name, value)
    index += 1
  }

  stack.push({
    macroId: macroCall.macro.$name,
    parameters: parameters,
    rootCallLocation: rootCallLocation,
  })

  const declarations: Declaration[] = []

  for (const son of macro.children) {
    if (son.$type === 'MacroCall') {
      const result = resolveMacroCall(son, stack, parseResult)
      if (result.isLeft()) {
        return result
      }
      declarations.push(...result.value)
    } else if (son.$type === 'Port') {
      declarations.push(resolvePort(son, stack[stack.length - 1]))
    } else if (son.$type === 'Media') {
      declarations.push(resolveMedia(son, stack[stack.length - 1]))
    } else if (son.$type === 'Region') {
      declarations.push(resolveRegion(son, stack[stack.length - 1]))
    } else if (son.$type === 'Context') {
      declarations.push(resolveContext(son, stack[stack.length - 1]))
    } else if (son.$type === 'Link') {
      declarations.push(resolveLink(son, stack[stack.length - 1]))
    }
  }

  stack.pop()
  return right(declarations)
}

/**
 * Realiza a validação e execução da MacroCall. Caso a validação falhe retorna um
 * erro do tipo {@link ValidationError}, caso contrário retorna a lista de declarações
 * criadas.
 */
function resolveMacroCall(
  macroCall: MacroCall,
  stack: Array<MacroStack>,
  parseResult: ParseResult<Declaration[]>
): Either<ValidationError, Declaration[]> {
  const macro = parseResult.value.find(
    (decl): decl is Macro => isMacro(decl) && decl.name === macroCall.macro.$name
  )
  const lastMacroCalled = stack.at(-1)

  // Valida se a macro foi definida
  if (!macro) {
    return left({
      message: `Macro with id '${macroCall.macro.$name}' is not defined.`,
      location: macroCall.macro.location,
    })
  }

  // Valida se o número de argumentos passados é igual ao de parâmetros da macro
  if (macro.parameters.length !== macroCall.arguments.length) {
    return left({
      message: `Wrong number of arguments. Expect: ${macro.parameters.length}, Receive: ${macroCall.arguments.length}.`,
      location: macroCall.location,
    })
  }

  /**
   * Para cada argumento verificar se ele foi passado como string literal ou através de um
   * identificador.
   */

  for (const argument of macroCall.arguments) {
    // Caso seja uma string literal, remover as aspas.
    if (isStringLiteral(argument.name)) {
      argument.name = removeQuotes(argument.name)
    } else {
      // Caso seja um identificador, ele deve existir como parâmetro da macro pai (última macro da pilha).
      if (lastMacroCalled) {
        const value = lastMacroCalled.parameters.get(argument.name)

        if (value !== undefined) {
          argument.name = value
        } else {
          return left({
            message: `Argument '${argument.name}' is not a parameter of macro '${macro.name}'.`,
            location: argument.location,
          })
        }
      } else {
        return left({
          message: `Argument ${argument.name} is invalid. Did you mean "${argument.name}"?`,
          location: argument.location,
        })
      }
    }
  }

  // Valida se a macro a ser chamada, já está na pilha, se estiver causará um loop.
  const macroAlreadyCalled = stack.find((m) => m.macroId === macroCall.macro.$name)

  if (macroAlreadyCalled) {
    return left({
      message: `Infinity recursion detected in macro '${macroCall.macro.$name}'.`,
      location: macroCall.location,
    })
  }

  return resolveMacroBody(macroCall, stack, parseResult)
}

type MacroStack = {
  macroId: string
  // paramIdentifier: paramValue (argumentValue)
  parameters: Map<string, string>
  rootCallLocation: Location
}

/**
 * Processa todas as chamadas de macro da raiz do documento.
 *
 * @param document - Documento já processado pela fase de Parsing e com a tabela de símbolos
 * previamente construída.
 */
export function processMacroCall(parseResult: ParseResult<Declaration[]>) {
  const macroCalls = parseResult.value.filter((decl) => decl.$type === 'MacroCall')

  for (const macroCall of macroCalls) {
    const stack: Array<MacroStack> = []
    const result = resolveMacroCall(macroCall, stack, parseResult)

    if (result.isLeft()) {
      parseResult.errors.push(result.value)
    } else {
      parseResult.value.push(...result.value)
    }
  }
}
