import { exec } from 'node:child_process'
import type { Terminal } from 'vscode'
import * as vscode from 'vscode'
import { TerminalManager } from './terminal-manager'

export class WindowsTerminalManager extends TerminalManager {
  private wslAvailable: boolean | undefined

  protected async validateBefore(): Promise<void> {
    // Se a verificação já foi validada como verdadeira não realiza ela de novo
    if (this.wslAvailable) {
      return
    }

    this.wslAvailable = await this.isWslAvailable()

    if (!this.wslAvailable) {
      this.errors.push('O compilador SNCL requer o WSL instalado.')
    }
  }

  /**
   * Verifica se o Windows Subsystem for Linux (WSL) está disponível e
   * possui ao menos uma distribuição instalada.
   *
   * O método executa o comando `wsl.exe -l -q` para listar as distribuições
   * registradas no sistema. Caso o comando falhe ou nenhuma distribuição
   * seja encontrada, o WSL é considerado indisponível.
   */
  private isWslAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      exec('wsl.exe -l -q', (err, stdout) => {
        if (err || stdout.trim().length === 0) {
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  protected getTerminal(): Terminal {
    if (!this.terminal) {
      return vscode.window.createTerminal({
        name: this.terminalName,
        shellPath: 'wsl.exe',
      })
    }

    return this.terminal
  }
  protected getCommand(filePath: string): string {
    return `sncl $(wslpath '${filePath}')`
  }
}
