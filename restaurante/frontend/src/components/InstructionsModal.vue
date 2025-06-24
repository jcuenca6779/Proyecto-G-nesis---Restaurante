<template>
  <div class="instructions-content">
    <h2>Instrucciones de Uso</h2>
    <p>Bienvenido al Sistema de Gestión de Mesas. Aquí tienes una guía rápida para usar la aplicación:</p>
    
    <ul>
      <li><strong>Mover Mesas y Grupos:</strong> Haz clic y arrastra cualquier mesa o grupo para posicionarlo libremente en el mapa.</li>
      <li><strong>Seleccionar:</strong> Un solo clic sobre una mesa o grupo lo seleccionará, mostrando sus opciones en el panel de "Controles".</li>
      <li><strong>Añadir Mesa:</strong> Usa el botón "➕ Añadir Mesa" en el panel de controles para abrir el formulario y crear una nueva mesa.</li>
      <li><strong>Editar Mesa:</strong> Selecciona una mesa individual y haz clic en "✏️ Editar Mesa" para cambiar su capacidad o estado.</li>
      <li><strong>Unir Mesas (Crear Grupo):</strong> Arrastra una mesa disponible sobre otra mesa también disponible. Se fusionarán automáticamente en un nuevo grupo.</li>
      <li><strong>Añadir a un Grupo Existente:</strong> Arrastra una mesa disponible sobre un grupo ya formado para incorporarla.</li>
      <li><strong>Separar Grupo:</strong> Selecciona un grupo y haz clic en el botón "✂️ Separar grupo" para disolverlo y que sus mesas vuelvan a ser individuales.</li>
      <li><strong>Eliminar Mesa:</strong> Selecciona una única mesa y usa el botón "🗑️ Eliminar Mesa". Los grupos no se pueden eliminar directamente, primero deben separarse.</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'InstructionsModal'
}
</script>

<style scoped>
.instructions-content {
  text-align: left;
  line-height: 1.8;
  color: #333;
}

.instructions-content h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #2c3e50;
}

.instructions-content p {
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.1rem;
}

.instructions-content ul {
  list-style-type: none;
  padding: 0;
}

.instructions-content li {
  background-color: #f8f9fa;
  border-left: 4px solid #3498db;
  padding: 12px 15px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.instructions-content li strong {
  color: #2c3e50;
  display: inline-block;
  margin-bottom: 4px;
}
</style>