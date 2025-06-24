<template>
  <div class="header">
    <h1>SISTEMA DE GESTIÓN DE MESAS</h1>
    <p>"El patacón de Óscar"</p>
  </div>
</template>

<script>
export default {
  name: 'Header'
}
</script>

<style scoped>
.header {
  background: linear-gradient(to right, #2c3e50, #1a237e);
  color: white;
  padding: 25px 0;
  text-align: center;
  position: relative;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}
</style>