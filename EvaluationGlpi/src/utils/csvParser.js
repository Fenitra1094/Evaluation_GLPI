/**
 * Parser CSV simple
 * Gère les guillemets et les virgules dans les valeurs
 */

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV vide ou sans données')
  }

  // Headers
  const headers = parseLine(lines[0])

  // Rows
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx].trim() : ''
    })
    row._lineNumber = i + 1   // Pour les messages d'erreur
    rows.push(row)
  }

  return { headers, rows }
}

function parseLine(line) {
  const result = []
  let current  = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}


/**
 * Lire un fichier File et retourner son texte
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Erreur lecture fichier'))
    reader.readAsText(file, 'UTF-8')
  })
}