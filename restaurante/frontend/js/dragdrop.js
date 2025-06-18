export function startDrag(
  event,
  item,
  type,
  draggingItem,
  dragStartPos,
  dragPosition
) {
  try {
    event.preventDefault();
    draggingItem.value = { ...item, type };
    dragStartPos.x = event.clientX;
    dragStartPos.y = event.clientY;
    dragPosition.x = item.x;
    dragPosition.y = item.y;
    document.body.style.cursor = "grabbing";
  } catch (error) {
    console.error("Error al iniciar el arrastre:", error);
    // Resetear el estado de arrastre en caso de error
    draggingItem.value = null;
    document.body.style.cursor = "";
  }
}

export function onDragMove(
  event,
  draggingItem,
  dragStartPos,
  dragPosition,
  mesasIndividuales,
  grupos,
  dropTarget,
  dropTargetGroup,
  mapWidth,
  mapHeight
) {
  if (!draggingItem.value) return;
  const dx = event.clientX - dragStartPos.x;
  const dy = event.clientY - dragStartPos.y;

  // Posición sin ajustar
  let rawX = draggingItem.value.x + dx;
  let rawY = draggingItem.value.y + dy;

  // Tamaño de la celda de la cuadrícula
  const gridSize = 50;

  // Ajustar a la cuadrícula
  let newX = Math.round(rawX / gridSize) * gridSize;
  let newY = Math.round(rawY / gridSize) * gridSize;

  // Usar tamaño personalizado si existe
  let width, height;

  if (draggingItem.value.type === "mesa") {
    const mesa = mesasIndividuales.value.find(
      (m) => m.id === draggingItem.value.id
    );
    if (mesa) {
      width = mesa.anchoCuadriculas * gridSize || 100;
      height = mesa.altoCuadriculas * gridSize || 100;
    }
  } else if (draggingItem.value.type === "grupo") {
    width = 200;
    height = 250;
  }

  // Asegurar que la mesa se mantiene dentro del mapa
  newX = Math.max(0, Math.min(mapWidth - width, newX));
  newY = Math.max(0, Math.min(mapHeight - height, newY));

  dragPosition.x = newX;
  dragPosition.y = newY;

  // Actualizar la posición del elemento arrastrado
  if (draggingItem.value.type === "mesa") {
    const mesa = mesasIndividuales.value.find(
      (m) => m.id === draggingItem.value.id
    );
    if (mesa) {
      mesa.x = newX;
      mesa.y = newY;
    }
  } else if (draggingItem.value.type === "grupo") {
    const grupo = grupos.value.find((g) => g.id === draggingItem.value.id);
    if (grupo) {
      grupo.x = newX;
      grupo.y = newY;
    }
  }

  // Lógica de detección de drop target
  dropTarget.value = null;
  const currentDraggedItem = draggingItem.value;
  const draggedWidth = width;
  const draggedHeight = height;

  // Detección de mesas
  const targetMesa = mesasIndividuales.value.find((mesa) => {
    if (mesa.id === currentDraggedItem.id) return false;

    return (
      Math.abs(mesa.x - newX) <
        (mesa.anchoCuadriculas * 50 + draggedWidth) / 2 &&
      Math.abs(mesa.y - newY) < (mesa.altoCuadriculas * 50 + draggedHeight) / 2
    );
  });

  if (targetMesa) {
    dropTarget.value = targetMesa.id;
  }

  // Lógica de detección de drop target (GRUPOS)
  dropTargetGroup.value = null;
  const targetGrupo = grupos.value.find((grupo) => {
    return (
      Math.abs(grupo.x - newX) < (200 + draggedWidth) / 2 &&
      Math.abs(grupo.y - newY) < (280 + draggedHeight) / 2
    );
  });

  if (targetGrupo) {
    dropTargetGroup.value = targetGrupo.id;
  }
}

export function stopDrag(draggingItem, dropTarget, dropTargetGroup) {
  if (draggingItem.value) {
    document.body.style.cursor = "";
    draggingItem.value = null;
    dropTarget.value = null;
    dropTargetGroup.value = null;
  }
}

export function handleDrop(
  event,
  target,
  draggingItem,
  mesasIndividuales,
  grupos,
  dropTarget,
  dropTargetGroup,
  unirMesaAGrupo,
  unirMesas,
  stopDragFn,
  showUnionFeedback
) {
  if (draggingItem.value && draggingItem.value.type === "mesa") {
    const mesaOrigen = mesasIndividuales.value.find(
      (m) => m.id === draggingItem.value.id
    );

    if (!mesaOrigen) {
      stopDragFn(draggingItem, dropTarget, dropTargetGroup);
      return;
    }

    if (dropTargetGroup.value) {
      const grupo = grupos.value.find((g) => g.id === dropTargetGroup.value);
      if (grupo && mesaOrigen) {
        unirMesaAGrupo(
          mesaOrigen,
          grupo,
          mesasIndividuales,
          grupos,
          showUnionFeedback
        );
      }
    } else if (dropTarget.value) {
      const mesaDestino = mesasIndividuales.value.find(
        (m) => m.id === dropTarget.value
      );
      if (mesaDestino && mesaDestino.id !== mesaOrigen.id) {
        unirMesas(
          mesaOrigen,
          mesaDestino,
          mesasIndividuales,
          grupos,
          showUnionFeedback
        );
      }
    }
  }
  stopDragFn(draggingItem, dropTarget, dropTargetGroup);
}
