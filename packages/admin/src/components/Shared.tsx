
import EditIcon from '@mui/icons-material/Edit.js';
import {
    Dialog,
    DialogTitle,
    Button as MuiButton,
    Typography,
} from '@mui/material';
import React from 'react';
import { Button, Form, useNotify, useRefresh, type Identifier } from 'react-admin';
import { useMutation } from '@tanstack/react-query';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import type { MutateForm } from 'src/types.js';

export const Empty = ({ assoc, children }: React.PropsWithChildren<{ assoc: string }>) => (
    <div>
        <Typography sx={{ marginBottom: '1rem' }}>No associated {assoc} found.</Typography>
        {children}
    </div>
);

export const EditReferenceButton: React.FC<{
    reference: string;
    Component: MutateForm
}> = ({ reference, Component }) => {
    const [showDialog, setShowDialog] = React.useState(false);
    return (
        <>
            <MuiButton onClick={() => setShowDialog(true)}>
                <EditIcon />
            </MuiButton>
            <Dialog
                fullWidth
                open={showDialog}
                onClose={() => setShowDialog(true)}
            >
                <DialogTitle>{`Edit ${reference}`}</DialogTitle>
                <Form>
                    <Component
                        setShowDialog={setShowDialog}
                    />
                </Form>
            </Dialog>
        </>
    );
};

export const AddReferenceButton: React.FC<{
    reference: string;
    Component: MutateForm;
    parentId?: Identifier;
}> = ({ reference, Component }) => {
    const [showDialog, setShowDialog] = React.useState(false);

    return (
        <>
            <Button
                onClick={() => setShowDialog(true)}
                label="ra.action.create"
                sx={{
                    '& span span': {
                        paddingRight: '0.5em',
                    },
                }}
                variant="outlined"
            />
            <Dialog
                fullWidth
                open={showDialog}
                onClose={() => setShowDialog(false)}
            >
                <DialogTitle>{`Create ${reference}`}</DialogTitle>
                <Form>
                    <Component
                        setShowDialog={setShowDialog}
                    />
                </Form>
            </Dialog>
        </>
    );
};

export const TrimButton = ({
    resource
}: { resource: string }) => {
    const notify = useNotify();
    const refresh = useRefresh();
    const dataProvider = useAppDataProvider();
    const { mutate, isPending } = useMutation({
        mutationFn: () =>
            dataProvider.trim(
                resource,
                {},
            ),
        onSuccess: () => {
                refresh();
                notify(`Trimming of ${resource} fields succeeded.`);
            },
        onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),

    });
    return (
        <Button
            label={"Trim fields"}
            onClick={() => mutate()}
            disabled={isPending}
        />
    );
};
