# sncl-language-server
This project is a small language server that provides IDE functionality for the [sNCL language](https://github.com/teleMidia-MA/sncl/). The goal is to provide language support within VS Code, with features that improve the experience during code development with the language.

The project consists of a TypeScript extension for VS Code. On the server side, the document parsing is done using the [Chevrotain](https://chevrotain.io/docs/) library, which allows defining tokens and writing grammar in JavaScript syntax, in addition to having TypeScript support.

Currently sncl-language-server features include syntax-highlighting, diagnostics, go-to-definition and rename.

## Development using VSCode
1. `npm i`
2. Open the project in VSCode: `code .`
3. In VSCode, press F5 or change to the Debug panel and click <kbd>Launch Client</kbd>
4. Create a .sncl file and if everything goes well you should see syntax highlighting and the other features described below.

## Features
- [x] error diagnostic

<img width="1046" height="798" alt="error-diagnostic" src="https://github.com/user-attachments/assets/c3befef5-62d2-4129-9874-e706de15280d" />

- [x] go to definition

<img width="1046" height="798" alt="go-to-definition" src="https://github.com/user-attachments/assets/fc046959-ea01-41fe-81da-793d667227be" />

- [x] rename
<img width="1046" height="798" alt="rename-provider" src="https://github.com/user-attachments/assets/a194c823-c3f3-4db3-9fa1-87b76d70a961" />

