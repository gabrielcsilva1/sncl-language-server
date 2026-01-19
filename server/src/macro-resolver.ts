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
import type { ValidationError } from './parser/parser'
import { getReference } from './references/linker'
import type { AstNode, Reference } from './syntax-tree'
import { isStringLiteral, removeQuotes } from './utils/utils'
import type { SnclDocument } from './workspace/document'

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
function validRef<T extends AstNode>(reference: Reference<T>, stack: MacroStack): Reference<T> {
  return {
    ...reference,
    $name: validValue(reference.$name, stack),
  }
}

function resolvePort(port: Port, stack: MacroStack, document: SnclDocument): Port {
  const newElement: Port = {
    ...port,
    name: validValue(port.name, stack),
    component: validRef(port.component, stack),
  }

  if (port.interface !== undefined) {
    port.interface = validRef(port.interface, stack)
  }

  document.symbolTable.addElement(newElement)

  return newElement
}

function resolveArea(area: Area, stack: MacroStack, document: SnclDocument): Area {
  const newElement: Area = {
    ...area,
    name: validValue(area.name, stack),
  }

  document.symbolTable.addElement(newElement)
  return newElement
}

function resolveMedia(media: Media, stack: MacroStack, document: SnclDocument): Media {
  const newElement: Media = {
    ...media,
    name: validValue(media.name, stack),
    children: [],
  }

  if (media.rg !== undefined) {
    newElement.rg = validRef(media.rg, stack)
  }

  for (const area of media.children) {
    newElement.children.push(resolveArea(area, stack, document))
  }

  document.symbolTable.addElement(newElement)
  return newElement
}

function resolveRegion(region: Region, stack: MacroStack, document: SnclDocument): Region {
  const newElement: Region = {
    ...region,
    name: validValue(region.name, stack),
    children: [],
  }

  for (const son of region.children) {
    newElement.children.push(resolveRegion(son, stack, document))
  }

  document.symbolTable.addElement(newElement)
  return newElement
}

function resolveBind(bind: Action | Condition, stack: MacroStack) {
  const newElement: Action | Condition = {
    ...bind,
    component: validRef(bind.component, stack),
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

function resolveContext(context: Context, stack: MacroStack, document: SnclDocument): Context {
  const newElement: Context = {
    ...context,
    name: validValue(context.name, stack),
    children: [],
  }

  for (const son of context.children) {
    newElement.children.push(resolveContextBody(son, stack, document))
  }

  document.symbolTable.addElement(newElement)
  return newElement
}

function resolveContextBody(element: ContextBody, stack: MacroStack, document: SnclDocument) {
  if (element.$type === 'Media') {
    return resolveMedia(element, stack, document)
  }
  if (element.$type === 'Port') {
    return resolvePort(element, stack, document)
  }
  if (element.$type === 'Context') {
    return resolveContext(element, stack, document)
  }

  return resolveLink(element, stack)
}

/**
 * Resolve as declarações dentro do corpo da Macro.
 */
function resolveMacroBody(
  macroCall: MacroCall,
  stack: Array<MacroStack>,
  document: SnclDocument
): Either<ValidationError, Declaration[]> {
  const macro = document.symbolTable.getElement(macroCall.macro.$name) as Macro

  const parameters: Map<string, string> = new Map()

  let index = 0
  for (const paramName of macro.parameters) {
    const value = removeQuotes(macroCall.arguments[index].value)
    parameters.set(paramName, value)
    index += 1
  }

  stack.push({
    macroId: macroCall.macro.$name,
    parameters: parameters,
  })

  const declarations: Declaration[] = []

  for (const son of macro.children) {
    if (son.$type === 'MacroCall') {
      const result = resolveMacroCall(son, stack, document)
      if (result.isLeft()) {
        return result
      }
      declarations.push(...result.value)
    } else if (son.$type === 'Port') {
      declarations.push(resolvePort(son, stack[stack.length - 1], document))
    } else if (son.$type === 'Media') {
      declarations.push(resolveMedia(son, stack[stack.length - 1], document))
    } else if (son.$type === 'Region') {
      declarations.push(resolveRegion(son, stack[stack.length - 1], document))
    } else if (son.$type === 'Context') {
      declarations.push(resolveContext(son, stack[stack.length - 1], document))
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
  document: SnclDocument
): Either<ValidationError, Declaration[]> {
  const macro = getReference(macroCall.macro.$name, document.symbolTable, ['Macro'])
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
    if (isStringLiteral(argument.value)) {
      argument.value = removeQuotes(argument.value)
    } else {
      // Caso seja um identificador, ele deve existir como parâmetro da macro pai (última macro da pilha).
      if (lastMacroCalled) {
        const value = lastMacroCalled.parameters.get(argument.value)

        if (value !== undefined) {
          argument.value = value
        } else {
          return left({
            message: `Argument '${argument.value}' is not a parameter of macro '${macro.name}'.`,
            location: argument.location,
          })
        }
      } else {
        return left({
          message: `Argument ${argument.value} is invalid. Did you mean "${argument.value}"?`,
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

  return resolveMacroBody(macroCall, stack, document)
}

type MacroStack = {
  macroId: string
  // paramIdentifier: paramValue (argumentValue)
  parameters: Map<string, string>
}

/**
 * Processa todas as chamadas de macro da raiz do documento.
 *
 * @param document - Documento já processado pela fase de Parsing e com a tabela de símbolos
 * previamente construída.
 */
export function processMacroCall(document: SnclDocument) {
  const macroCalls = document.parseResult.value.filter((decl) => decl.$type === 'MacroCall')

  for (const macroCall of macroCalls) {
    const stack: Array<MacroStack> = []
    const result = resolveMacroCall(macroCall, stack, document)

    if (result.isLeft()) {
      document.parseResult.errors.push(result.value)
    } else {
      document.parseResult.value.push(...result.value)
    }
  }
}
