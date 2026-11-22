/** Bloco "fantasma" exibido no lugar do conteúdo enquanto os dados carregam. */
export default function Skeleton({ width = '100%', height = 16, radius = 6, className = '' }) {
  return <span className={`skeleton ${className}`.trim()} style={{ width, height, borderRadius: radius }} aria-hidden="true" />
}
