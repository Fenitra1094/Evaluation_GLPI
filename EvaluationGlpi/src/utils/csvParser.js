/**
 * Parser CSV qui gère :
 * - Les guillemets simples : "abc"
 * - Les guillemets échappés : "a""b" → a"b
 * - Les virgules dans les valeurs entre guillemets
 */

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')

  if (lines.length < 2) {
    throw new Error('CSV vide ou sans données')
  }

  const headers = parseLine(lines[0])

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i])
    const row = {}
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx].trim() : ''
    })
    row._lineNumber = i + 1
    rows.push(row)
  }

  return { headers, rows }
}

/**
 * Parse une ligne CSV en gérant les guillemets échappés
 */
function parseLine(line) {
  const result = []
  let current  = ''
  let inQuotes = false
  let i = 0

  while (i < line.length) {
    const char     = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // ✅ "" dans une valeur entre guillemets = " échappé
        current += '"'
        i += 2
        continue
      } else {
        // Début ou fin de valeur entre guillemets
        inQuotes = !inQuotes
        i++
        continue
      }
    }

    if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
      i++
      continue
    }

    current += char
    i++
  }

  result.push(current)
  return result
}


/**
 * Lit un fichier File et retourne son texte
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Erreur lecture fichier'))
    reader.readAsText(file, 'UTF-8')
  })
}