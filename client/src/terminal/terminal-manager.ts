import * as vscode from 'vscode'

export abstract class TerminalManager implements vscode.Disposable {
  protected terminal: vscode.Terminal | undefined
  protected errors: string[] = []

  protected readonly terminalName = 'SNCL Compiler'

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.window.onDidCloseTerminal((t) => {
        if (t === this.terminal) {
          this.terminal = undefined
        }
      })
    )
  }

  /**
   * Lógica para validação antes executar o comando do sncl.
   * Usado somente no Windows devido o uso do wsl (Windows Subsystem for Linux).
   * Adiciona os erros em {@link TerminalManager.errors}.
   */
  protected abstract validateBefore(): Promise<void>

  /**
   * Retorna a instancia salva do terminal. Caso não exista,
   * cria uma nova instância.
   */
  protected abstract getTerminal(): vscode.Terminal

  /**
   * Retorna o comando personalizado para cada sistema (Windows/Linux)
   */
  protected abstract getCommand(filePath: string): string

  public async runSnclCommand(filePath: string) {
    await this.validateBefore()

    if (this.errors.length > 0) {
      vscode.window.showErrorMessage(this.errors[0])
      this.errors = []
      return
    }

    this.terminal = this.getTerminal()

    this.terminal.show()

    const command = this.getCommand(filePath)

    this.terminal.sendText(command)
  }

  /**
   * Limpa o terminal ao fechar a extensão.
   */
  public dispose(): void {
    if (this.terminal) {
      this.terminal.dispose()
    }
  }
}
