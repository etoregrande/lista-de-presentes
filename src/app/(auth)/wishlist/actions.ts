import { Context, useContext } from "react";

export function useGetContext<T>(context: Context<T | null>) {
    const contextParams = useContext(context);
    if (!contextParams) {
        throw new Error("Este componente deve ser usado dentro do contexto apropriado");
    }

    return contextParams;
}