# 📅 Formats de date - Guide rapide

> ⚡ Doc express : trouve ce qu'il te faut en 10 secondes.

---

## 🎯 TABLEAU PRINCIPAL : que copier-coller ?

| Je veux... | Code |
|------------|------|
| 📥 Date actuelle dans `<input type="datetime-local">` | `new Date().toISOString().slice(0, 16)` |
| 📥 Date actuelle dans `<input type="date">` | `new Date().toISOString().slice(0, 10)` |
| 🇫🇷 Afficher en français (15/12/2024 14:30) | `formatDate(date)` |
| 📤 Envoyer à GLPI | `input.replace('T', ' ') + ':00'` |
| 🕐 "Il y a 3h" | `timeAgo(date)` |

---

## 🔥 LE HELPER À COPIER

📂 `src/utils/dateHelpers.js`

```javascript
// FORMAT FRANÇAIS : "15/12/2024 14:30"
export function formatDate(date, withTime = true) {
  if (!date) return '—'
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric' }
  if (withTime) { opts.hour = '2-digit'; opts.minute = '2-digit' }
  return new Date(date).toLocaleString('fr-FR', opts)
}

// INPUT → GLPI : "2024-12-15T14:30" → "2024-12-15 14:30:00"
export function toGlpiFormat(input) {
  if (!input) return null
  return input.replace('T', ' ') + ':00'
}

// MAINTENANT pour <input type="datetime-local">
export function nowForInput() {
  return new Date().toISOString().slice(0, 16)
}

// AUJOURD'HUI pour <input type="date">
export function todayForInput() {
  return new Date().toISOString().slice(0, 10)
}

// "Il y a X temps"
export function timeAgo(date) {
  if (!date) return '—'
  const diff = (new Date() - new Date(date)) / 1000
  if (diff < 60)       return "à l'instant"
  if (diff < 3600)     return `il y a ${Math.floor(diff/60)} min`
  if (diff < 86400)    return `il y a ${Math.floor(diff/3600)} h`
  if (diff < 2592000)  return `il y a ${Math.floor(diff/86400)} j`
  return `il y a ${Math.floor(diff/2592000)} mois`
}