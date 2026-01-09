import Sortable, { SortableEvent } from 'sortablejs';

export interface DragDropSortOptions<T> {
  container: HTMLElement;
  items: T[];
  renderItem: (item: T, index: number) => HTMLElement;
  onReorder: (newItems: T[]) => void;
  handle?: string;
  animation?: number;
  ghostClass?: string;
  chosenClass?: string;
  dragClass?: string;
  itemDataAttribute?: string;
  getItemLabel?: (item: T, index: number) => string;
}

export interface DragDropSortInstance<T> {
  sortable: Sortable;
  refresh: (items: T[]) => void;
  destroy: () => void;
  getItems: () => T[];
}

export function createDragDropSort<T>(
  options: DragDropSortOptions<T>
): DragDropSortInstance<T> {
  const {
    container,
    items: initialItems,
    renderItem,
    onReorder,
    handle,
    animation = 250,
    ghostClass = 'sortable-ghost',
    chosenClass = 'sortable-chosen',
    dragClass = 'sortable-drag',
    itemDataAttribute = 'data-index',
    getItemLabel = (_item, index) => `Item ${index + 1}`,
  } = options;

  let currentItems = [...initialItems];
  let liveRegion: HTMLElement | null = null;

  const createLiveRegion = () => {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      document.body.appendChild(liveRegion);
    }
    return liveRegion;
  };

  const announce = (message: string) => {
    const region = createLiveRegion();
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  };

  const setupAccessibility = (element: HTMLElement, item: T, index: number) => {
    element.setAttribute('role', 'listitem');
    element.setAttribute('aria-grabbed', 'false');
    element.setAttribute('tabindex', '0');
    element.setAttribute(
      'aria-label',
      `${getItemLabel(item, index)}. Position ${index + 1} of ${currentItems.length}. Press Space to grab, use arrow keys to reorder.`
    );
  };

  const updateAllAriaLabels = () => {
    Array.from(container.children).forEach((child, index) => {
      const el = child as HTMLElement;
      el.setAttribute(itemDataAttribute, index.toString());
      el.setAttribute(
        'aria-label',
        `${getItemLabel(currentItems[index], index)}. Position ${index + 1} of ${currentItems.length}. Press Space to grab, use arrow keys to reorder.`
      );
    });
  };

  const handleKeyboardReorder = (e: KeyboardEvent, element: HTMLElement) => {
    const index = parseInt(element.getAttribute(itemDataAttribute) || '0', 10);
    const isGrabbed = element.getAttribute('aria-grabbed') === 'true';

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const newGrabbed = !isGrabbed;
      element.setAttribute('aria-grabbed', String(newGrabbed));
      element.classList.toggle('keyboard-grabbed', newGrabbed);

      if (newGrabbed) {
        announce(
          `Grabbed ${getItemLabel(currentItems[index], index)}. Use arrow keys to move, Space or Enter to drop.`
        );
      } else {
        announce(
          `Dropped ${getItemLabel(currentItems[index], index)} at position ${index + 1}.`
        );
      }
    } else if (isGrabbed && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const newIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;

      if (newIndex >= 0 && newIndex < currentItems.length) {
        const newItems = [...currentItems];
        const [movedItem] = newItems.splice(index, 1);
        newItems.splice(newIndex, 0, movedItem);
        currentItems = newItems;

        renderAllItems(currentItems);
        onReorder(currentItems);

        const newElement = container.children[newIndex] as HTMLElement;
        newElement.setAttribute('aria-grabbed', 'true');
        newElement.classList.add('keyboard-grabbed');
        newElement.focus();

        announce(
          `Moved to position ${newIndex + 1} of ${currentItems.length}.`
        );
      }
    } else if (e.key === 'Escape' && isGrabbed) {
      e.preventDefault();
      element.setAttribute('aria-grabbed', 'false');
      element.classList.remove('keyboard-grabbed');
      announce(
        `Cancelled. ${getItemLabel(currentItems[index], index)} remains at position ${index + 1}.`
      );
    }
  };

  const renderAllItems = (items: T[]) => {
    container.innerHTML = '';
    container.setAttribute('role', 'list');
    container.setAttribute(
      'aria-label',
      `Sortable list with ${items.length} items. Drag and drop to reorder, or use keyboard.`
    );

    items.forEach((item, index) => {
      const element = renderItem(item, index);
      element.setAttribute(itemDataAttribute, index.toString());
      element.classList.add('sortable-item');
      setupAccessibility(element, item, index);
      element.addEventListener('keydown', (e) =>
        handleKeyboardReorder(e, element)
      );
      container.appendChild(element);
    });
  };

  renderAllItems(currentItems);

  const sortable = Sortable.create(container, {
    handle: handle,
    animation,
    ghostClass,
    chosenClass,
    dragClass,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    onStart: (evt: SortableEvent) => {
      if (evt.item) {
        evt.item.setAttribute('aria-grabbed', 'true');
        const index = evt.oldIndex ?? 0;
        announce(
          `Dragging ${getItemLabel(currentItems[index], index)} from position ${index + 1}.`
        );
      }
    },
    onEnd: (evt: SortableEvent) => {
      if (evt.item) {
        evt.item.setAttribute('aria-grabbed', 'false');
      }

      const { oldIndex, newIndex } = evt;
      if (
        oldIndex !== undefined &&
        newIndex !== undefined &&
        oldIndex !== newIndex
      ) {
        const newItems = [...currentItems];
        const [movedItem] = newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, movedItem);
        currentItems = newItems;

        updateAllAriaLabels();
        onReorder(currentItems);

        announce(
          `${getItemLabel(currentItems[newIndex], newIndex)} moved to position ${newIndex + 1} of ${currentItems.length}.`
        );
      } else if (oldIndex !== undefined) {
        announce(
          `${getItemLabel(currentItems[oldIndex], oldIndex)} dropped at original position.`
        );
      }
    },
  });

  const refresh = (items: T[]) => {
    currentItems = [...items];
    renderAllItems(currentItems);
  };

  const destroy = () => {
    sortable.destroy();
    container.innerHTML = '';
    if (liveRegion && liveRegion.parentNode) {
      liveRegion.parentNode.removeChild(liveRegion);
      liveRegion = null;
    }
  };

  const getItems = () => [...currentItems];

  return {
    sortable,
    refresh,
    destroy,
    getItems,
  };
}

export interface FileListDragDropOptions {
  container: HTMLElement;
  files: File[];
  onReorder: (newFiles: File[]) => void;
  onRemove?: (file: File, index: number) => void;
  formatFileSize?: (bytes: number) => string;
  showRemoveButton?: boolean;
  showDragHandle?: boolean;
  itemClassName?: string;
}

export interface FileListDragDropInstance {
  sortable: Sortable;
  refresh: (files: File[]) => void;
  destroy: () => void;
  getFiles: () => File[];
}

const defaultFormatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function createFileListDragDrop(
  options: FileListDragDropOptions
): FileListDragDropInstance {
  const {
    container,
    files: initialFiles,
    onReorder,
    onRemove,
    formatFileSize = defaultFormatFileSize,
    showRemoveButton = true,
    showDragHandle = true,
    itemClassName = 'sortable-item flex items-center justify-between bg-gray-700 p-3 rounded-lg text-sm cursor-grab active:cursor-grabbing',
  } = options;

  let currentFiles = [...initialFiles];
  let liveRegion: HTMLElement | null = null;

  const createLiveRegion = () => {
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      document.body.appendChild(liveRegion);
    }
    return liveRegion;
  };

  const announce = (message: string) => {
    const region = createLiveRegion();
    region.textContent = '';
    setTimeout(() => {
      region.textContent = message;
    }, 50);
  };

  const getFileLabel = (file: File) =>
    `${file.name}, ${formatFileSize(file.size)}`;

  const setupAccessibility = (
    element: HTMLElement,
    file: File,
    index: number,
    totalCount: number
  ) => {
    element.setAttribute('role', 'listitem');
    element.setAttribute('aria-grabbed', 'false');
    element.setAttribute('tabindex', '0');
    element.setAttribute(
      'aria-label',
      `${getFileLabel(file)}. Position ${index + 1} of ${totalCount}. Press Space to grab and reorder, use arrow keys to move.`
    );
    element.setAttribute('aria-describedby', 'drag-instructions');
  };

  const updateAllAriaLabels = () => {
    Array.from(container.children).forEach((child, index) => {
      if (child.getAttribute('id') === 'drag-instructions') return;
      const el = child as HTMLElement;
      el.setAttribute('data-file-index', index.toString());
      if (currentFiles[index]) {
        el.setAttribute(
          'aria-label',
          `${getFileLabel(currentFiles[index])}. Position ${index + 1} of ${currentFiles.length}. Press Space to grab and reorder, use arrow keys to move.`
        );
      }
    });
  };

  const handleKeyboardReorder = (e: KeyboardEvent, element: HTMLElement) => {
    const index = parseInt(element.getAttribute('data-file-index') || '0', 10);
    const isGrabbed = element.getAttribute('aria-grabbed') === 'true';
    const file = currentFiles[index];

    if (e.key === ' ' || e.key === 'Enter') {
      if (e.target instanceof HTMLButtonElement) return;

      e.preventDefault();
      const newGrabbed = !isGrabbed;
      element.setAttribute('aria-grabbed', String(newGrabbed));
      element.classList.toggle('keyboard-grabbed', newGrabbed);

      if (newGrabbed) {
        announce(
          `Grabbed ${file.name}. Use Up and Down arrow keys to move, Space or Enter to drop.`
        );
      } else {
        announce(`Dropped ${file.name} at position ${index + 1}.`);
      }
    } else if (isGrabbed && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
      e.preventDefault();
      const newIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;

      if (newIndex >= 0 && newIndex < currentFiles.length) {
        const newFiles = [...currentFiles];
        const [movedFile] = newFiles.splice(index, 1);
        newFiles.splice(newIndex, 0, movedFile);
        currentFiles = newFiles;

        renderAllFiles(currentFiles);
        onReorder(currentFiles);

        const newElement = container.children[newIndex] as HTMLElement;
        newElement.setAttribute('aria-grabbed', 'true');
        newElement.classList.add('keyboard-grabbed');
        newElement.focus();

        announce(
          `Moved ${file.name} to position ${newIndex + 1} of ${currentFiles.length}.`
        );
      } else {
        announce(
          e.key === 'ArrowUp'
            ? 'Already at the top of the list.'
            : 'Already at the bottom of the list.'
        );
      }
    } else if (e.key === 'Escape' && isGrabbed) {
      e.preventDefault();
      element.setAttribute('aria-grabbed', 'false');
      element.classList.remove('keyboard-grabbed');
      announce(`Cancelled. ${file.name} remains at position ${index + 1}.`);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (onRemove && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        onRemove(file, index);
        announce(`Removed ${file.name} from the list.`);
      }
    }
  };

  const renderFileItem = (file: File, index: number): HTMLElement => {
    const fileDiv = document.createElement('div');
    fileDiv.className = itemClassName;
    fileDiv.setAttribute('data-file-index', index.toString());
    fileDiv.setAttribute('data-file-name', file.name);
    fileDiv.draggable = true;

    setupAccessibility(fileDiv, file, index, currentFiles.length);
    fileDiv.addEventListener('keydown', (e) =>
      handleKeyboardReorder(e, fileDiv)
    );

    const infoContainer = document.createElement('div');
    infoContainer.className = 'flex items-center gap-2 overflow-hidden flex-1';

    if (showDragHandle) {
      const dragHandle = document.createElement('div');
      dragHandle.className =
        'drag-handle text-gray-400 p-1 rounded transition-colors flex-shrink-0';
      dragHandle.setAttribute('aria-hidden', 'true');
      dragHandle.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="5" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
      infoContainer.appendChild(dragHandle);
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'truncate font-medium text-gray-200';
    nameSpan.textContent = file.name;
    nameSpan.title = file.name;

    const sizeSpan = document.createElement('span');
    sizeSpan.className = 'flex-shrink-0 text-gray-400 text-xs';
    sizeSpan.textContent = `(${formatFileSize(file.size)})`;

    infoContainer.append(nameSpan, sizeSpan);
    fileDiv.appendChild(infoContainer);

    if (showRemoveButton && onRemove) {
      const removeBtn = document.createElement('button');
      removeBtn.className =
        'ml-4 text-red-400 hover:text-red-300 flex-shrink-0 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-gray-700';
      removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Remove ${file.name}`);
      removeBtn.onclick = (e) => {
        e.stopPropagation();
        onRemove(file, index);
        announce(`Removed ${file.name} from the list.`);
      };
      fileDiv.appendChild(removeBtn);
    }

    return fileDiv;
  };

  const renderAllFiles = (files: File[]) => {
    container.innerHTML = '';
    container.setAttribute('role', 'list');
    container.setAttribute(
      'aria-label',
      `File list with ${files.length} files. Drag and drop to reorder.`
    );

    files.forEach((file, index) => {
      const element = renderFileItem(file, index);
      container.appendChild(element);
    });
  };

  renderAllFiles(currentFiles);

  const sortable = Sortable.create(container, {
    animation: 250,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    forceFallback: false,
    onStart: (evt: SortableEvent) => {
      if (evt.item) {
        evt.item.setAttribute('aria-grabbed', 'true');
        const index = evt.oldIndex ?? 0;
        const file = currentFiles[index];
        announce(`Dragging ${file.name} from position ${index + 1}.`);
      }
    },
    onEnd: (evt: SortableEvent) => {
      if (evt.item) {
        evt.item.setAttribute('aria-grabbed', 'false');
      }

      const { oldIndex, newIndex } = evt;
      if (
        oldIndex !== undefined &&
        newIndex !== undefined &&
        oldIndex !== newIndex
      ) {
        const newFiles = [...currentFiles];
        const [movedFile] = newFiles.splice(oldIndex, 1);
        newFiles.splice(newIndex, 0, movedFile);
        currentFiles = newFiles;

        updateAllAriaLabels();
        onReorder(currentFiles);

        announce(
          `${currentFiles[newIndex].name} moved to position ${newIndex + 1} of ${currentFiles.length}.`
        );
      } else if (oldIndex !== undefined) {
        announce(
          `${currentFiles[oldIndex].name} dropped at original position.`
        );
      }
    },
  });

  const refresh = (files: File[]) => {
    currentFiles = [...files];
    renderAllFiles(currentFiles);
  };

  const destroy = () => {
    sortable.destroy();
    container.innerHTML = '';
    if (liveRegion && liveRegion.parentNode) {
      liveRegion.parentNode.removeChild(liveRegion);
      liveRegion = null;
    }
  };

  const getFiles = () => [...currentFiles];

  return {
    sortable,
    refresh,
    destroy,
    getFiles,
  };
}
