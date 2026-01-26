# sncl-language-server
This project is a small language server that provides IDE functionality for the [sNCL language](https://github.com/teleMidia-MA/sncl/). The goal is to provide language support within VS Code, with features that improve the experience during code development with the language.

The project consists of a TypeScript extension for VS Code. On the server side, the document parsing is done using the [Chevrotain](https://chevrotain.io/docs/) library, which allows defining tokens and writing grammar in JavaScript syntax, in addition to having TypeScript support.

Currently sncl-language-server features include syntax-highlighting and diagnostics.
