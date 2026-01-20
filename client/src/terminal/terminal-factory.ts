import type { ExtensionContext } from 'vscode'
import { LinuxTerminalManager } from './linux-terminal-manager'
import type { TerminalManager } from './terminal-manager'
import { WindowsTerminalManager } from './windows-terminal-manager'

/**
 * Cria uma instancia de {@link TerminalManager} dependendo do
 * sistema operacional.
 */
export function makeTerminalManager(context: ExtensionContext): TerminalManager {
  if (process.platform === 'win32') {
    return new WindowsTerminalManager(context)
  }

  return new LinuxTerminalManager(context)
}
