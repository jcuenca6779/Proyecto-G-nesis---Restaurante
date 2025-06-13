export function startDrag(
  event,
  item,
  type,
  draggingItem,
  dragStartPos,
  dragPosition
) {
  event.preventDefault();
  draggingItem.value = { ...item, type };
  dragStartPos.x = event.clientX;
  dragStartPos.y = event.clientY;
  dragPosition.x = item.x;
  dragPosition.y = item.y;
  document.body.style.cursor = "grabbing";
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

  let newX = draggingItem.value.x + dx;
  let newY = draggingItem.value.y + dy;

  const buffer =
    draggingItem.value.type === "mesa"
      ? { x: 150, y: 110 }
      : { x: 200, y: 250 };

  newX = Math.max(0, Math.min(mapWidth - buffer.x, newX));
  newY = Math.max(0, Math.min(mapHeight - buffer.y, newY));

  dragPosition.x = newX;
  dragPosition.y = newY;

  // Actualizar la posición real del elemento en los datos reactivos
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

  dropTarget.value = null;
  dropTargetGroup.value = null;

  if (draggingItem.value.type === "mesa") {
    const currentDraggedItemX = newX;
    const currentDraggedItemY = newY;

    const targetMesa = mesasIndividuales.value.find((mesa) => {
      if (mesa.id === draggingItem.value.id) return false;
      const distDx = Math.abs(mesa.x - currentDraggedItemX);
      const distDy = Math.abs(mesa.y - currentDraggedItemY);
      const distancia = Math.sqrt(distDx * distDx + distDy * distDy);
      return distancia < 150;
    });

    if (targetMesa) {
      dropTarget.value = targetMesa.id;
    }

    const targetGrupo = grupos.value.find((grupo) => {
      const distDx = Math.abs(grupo.x - currentDraggedItemX);
      const distDy = Math.abs(grupo.y - currentDraggedItemY);
      const distancia = Math.sqrt(distDx * distDx + distDy * distDy);
      return distancia < 150; // Proximity threshold for dropping a mesa onto a group
    });

    if (targetGrupo) {
      dropTargetGroup.value = targetGrupo.id;
    }
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
    } else if (target && target.id && target.id !== mesaOrigen.id) {
      const mesaDestino = mesasIndividuales.value.find(
        (m) => m.id === target.id
      );
      // Asegurarse de que el 'target' es una mesa individual válida y diferente de la origen
      if (mesaDestino) {
        unirMesas(mesaOrigen, mesaDestino);
      }
    }
  }
  stopDragFn(draggingItem, dropTarget, dropTargetGroup);
}
