import React, { MouseEventHandler } from "react";

import { createPortal } from "react-dom";
import styles from "./Modal.module.css";

type ModalProps = {
    onConfirm?: <T>(data: T) => void;
    onClose?: () => void;
    trigger?: (onClick: MouseEventHandler<HTMLButtonElement>) => React.ReactNode;
    isOpen?: boolean;
    children: React.ReactNode;
    showConfirmButton?: boolean;
    title: string;
    contentClassName?: string;
    className?: string;
}

const Modal = ({
    onConfirm,
    onClose,
    trigger,
    children,
    showConfirmButton = true,
    title,
    isOpen = false,
    contentClassName,
    className,
}: ModalProps) => {
    const [innerIsOpen, setInnerIsOpen] = React.useState(false);
    return (
        <>
            {trigger && (
                <div className={styles.trigger}>
                    {trigger(() => setInnerIsOpen(true))}
                </div>
            )}
            {(innerIsOpen || isOpen) && createPortal(
                <ModalContent isOpen={innerIsOpen || isOpen} onClose={() => {
                    setInnerIsOpen(false);
                    if (onClose) onClose();
                }} onConfirm={onConfirm} showConfirmButton={showConfirmButton} title={title} contentClassName={contentClassName} className={className}>{children}</ModalContent>,
                document.body
            )}
        </>
    )
};

type ModalContentProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: <T>(data: T) => void;
    children?: React.ReactNode;
    title: string;
    showConfirmButton?: boolean;
    contentClassName?: string;
    className?: string;
}

const ModalContent = ({
    isOpen,
    onClose,
    onConfirm,
    children,
    title,
    showConfirmButton = true,
    contentClassName,
    className,
}: ModalContentProps) => {
    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose} />
            <div className={`${styles.modal}${className ? ` ${className}` : ""}`}>
                <div className={styles.modalHeader}>
                        <span>{title}</span>
                        <span className={styles.close} onClick={onClose}>&times;</span>
                    </div>
                <div className={`${styles.modalContent}${contentClassName ? ` ${contentClassName}` : ""}`}>
                    {children}
                </div>
                <div className={styles.modalFooter}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
                    {showConfirmButton && <button onClick={onConfirm} className={styles.saveButton}>Confirm</button>}
                </div>
            </div>
        </>
    );
}

export default Modal;