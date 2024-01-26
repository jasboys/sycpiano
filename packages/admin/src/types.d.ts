export interface AdminError {
    message: string;
}

export type MutateForm = React.FC<{
    setShowDialog: (t: boolean) => void;
}>;
