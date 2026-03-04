import React, { createContext, useContext } from "react";
import {ToastContainer, useToast as useToastInternal } from "../components/ui/index.js";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
    const { toasts, addToast, removeToast } = useToastInternal();

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}