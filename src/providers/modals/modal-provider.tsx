import { ConnectAccountModel } from "@/components/modals/connect-account-modal";

export function ModalProvider({ children }: {
    children: React.ReactNode
}) {
    return (
        <>
        {children}
        <ConnectAccountModel/>
        </>
    )
}