import axios from 'axios'

export async function discoverResources() {
  const baseUrl = import.meta.env.VITE_GLPI_BASE_URL.replace(/\/v\d+$/, '')
  const docUrl  = `${baseUrl}/doc.json`

  console.log('🔍 Découverte des ressources via :', docUrl)

  try {
    const response = await axios.get(docUrl)
    const schema   = response.data

    const map = new Map()

    for (const path in schema.paths) {
      //Match : /category
       // Exemple : /Assets/Computer, /Assistance/Ticket

      const matches = path.match(/^\/([A-Z][a-zA-Z0-9]+)\/([A-Z][a-zA-Z0-9]+)$/)
      if (matches) {
        const category = matches[1]
        const resource = matches[2] 

        //Eviter les doublons
        if (!map.has(resource)) {
          map.set(resource, { key: resource, category })
        }
      }
    }

    const list = Array.from(map.values()).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.key.localeCompare(b.key)
    })

    console.log('✅ Ressources découvertes :', list.length)
    return list

  } catch (err) {
    console.error('❌ Erreur découverte :', err.message)
    return []
  }
}