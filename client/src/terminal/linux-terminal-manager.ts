import type { Terminal } from 'vscode'
import * as vscode from 'vscode'
import { TerminalManager } from './terminal-manager'

export class LinuxTerminalManager extends TerminalManager {
  protected async validateBefore(): Promise<void> {}

  protected getTerminal(): Terminal {
    if (!this.terminal) {
      return vscode.window.createTerminal({
        name: this.terminalName,
      })
    }

    return this.terminal
  }

  protected getCommand(filePath: string): string {
    return `sncl "${filePath}"`
  }
}
