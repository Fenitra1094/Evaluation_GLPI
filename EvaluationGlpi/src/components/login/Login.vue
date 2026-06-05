<template>
    <div class ="code">
          <h3>Entrez le code</h3>
      <input type="text" v-model="code" placeholder="Entrez votre code" />
      <button @click="recupererCode">Connecter</button>
    </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const code = ref('')
const router = useRouter()
function recupererCode(){
  if(code.value.trim() === ''){
    alert('Veuillez entrer un code valide')
    return
  }
  router.push('/home')
  
}
</script>
