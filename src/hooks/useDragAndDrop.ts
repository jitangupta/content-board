import { useCallback, useState } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface OperationState {
  loading: boolean;
  error: string | null;
}

interface UseDragAndDropOptions {
  items: string[];
  onReorder: (orderedIds: string[]) => Promise<void>;
}

interface UseDragAndDropReturn {
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
  operationState: OperationState;
}

export function useDragAndDrop({
  items,
  onReorder,
}: UseDragAndDropOptions): UseDragAndDropReturn {
  const [operationState, setOperationState] = useState<OperationState>({
    loading: false,
    error: null,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reordered = arrayMove(items, oldIndex, newIndex);

      setOperationState({ loading: true, error: null });
      onReorder(reordered)
        .then(() => {
          setOperationState({ loading: false, error: null });
        })
        .catch(() => {
          setOperationState({ loading: false, error: 'Failed to reorder items' });
        });
    },
    [items, onReorder],
  );

  return { sensors, handleDragEnd, operationState };
}
