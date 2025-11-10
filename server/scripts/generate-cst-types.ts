import * as fs from 'node:fs'
import path from 'node:path'
import { generateCstDts } from 'chevrotain'
import { sNCLParser } from '../src/chevrotain/parser'

const productions = sNCLParser.getGAstProductions()

const fileContent = generateCstDts(productions, {
  visitorInterfaceName: 'ISnclNodeVisitor',
})

const folderPath = path.resolve('./server/src/chevrotain/generated')

console.log(folderPath)
const filePath = path.join(folderPath, 'cst-types.ts')

const header = `/**
* @generated
* ESTE ARQUIVO FOI GERADO AUTOMATICAMENTE.
* 
* Gerado por: server/scripts/generate-cst-types.ts
* Script: npm run gen:cst-types
* 
* NÃO EDITE ESTE ARQUIVO MANUALMENTE.
*/

`
// Cria a pasta se não existir
fs.mkdirSync(folderPath, { recursive: true })

// Cria o arquivo (ou sobrescreve se já existir)
fs.writeFileSync(filePath, header + fileContent, 'utf-8')

// fs.writeFileSync(
//   '/server/src/core/chevrotain/generated/cst-types.ts',
//   header + fileContent
// )
