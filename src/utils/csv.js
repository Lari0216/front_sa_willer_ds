// Exporta linhas para CSV compatível com o Excel em português (separador ";" e BOM UTF-8).

function escapeCell(value) {
  const text = value === null || value === undefined ? '' : String(value)
  return /[;"\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * @param {string} filename
 * @param {{ header: string, value: (row: object) => unknown }[]} columns
 * @param {object[]} rows
 */
export function downloadCsv(filename, columns, rows) {
  const lines = [columns.map((c) => escapeCell(c.header)).join(';')]
  rows.forEach((row) => lines.push(columns.map((c) => escapeCell(c.value(row))).join(';')))

  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
