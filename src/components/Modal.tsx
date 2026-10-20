import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}

/** Native modal dialogs provide focus containment, Escape, and focus restoration. */
export function Modal({ isOpen, onClose, children, className, ...label }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return <dialog
    ref={ref}
    {...label}
    className={`m-0 border-0 max-w-none max-h-none w-full h-full backdrop:bg-transparent ${className}`}
    onCancel={(event) => { event.preventDefault(); onClose(); }}
  >{isOpen ? children : null}</dialog>;
}
