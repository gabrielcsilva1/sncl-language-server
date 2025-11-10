/**
 * Cria um tipo `T` onde apenas algumas propriedades `K` são opcionais.
 * 
 * @example
 * interface Usuario {
 *   id: number;
 *   nome: string;
 *   email: string;
 *   ativo: boolean;
 * }
 *
 * // Torna apenas `email` e `ativo` opcionais
 * type UsuarioOpcional = Optional<Usuario, 'email' | 'ativo'>;
 *
 * // Equivalente a:
 * // {
 * //   id: number;
 * //   nome: string;
 * //   email?: string;
 * //   ativo?: boolean;
 * // }
 */
export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>
