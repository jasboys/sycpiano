
import EditIcon from '@mui/icons-material/Edit.js';
import {
    Dialog,
    DialogTitle,
    Button as MuiButton,
    Typography,
} from '@mui/material';
import React from 'react';
import { Button, Form, useNotify, useRefresh } from 'react-admin';
import { useMutation } from 'react-query';
import { useAppDataProvider } from 'src/providers/restProvider.js';
import { MutateForm } from 'src/types.js';

export const Empty = ({ assoc }: { assoc: string }) => (
    <Typography sx={{ marginBottom: '1rem' }}>No associated {assoc} found.</Typography>
);

export const EditReferenceButton: React.FC<{
    reference: string;
    Component: MutateForm;
    onRefresh: () => void;
}> = ({ reference, Component, onRefresh }) => {
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
                        onRefresh={onRefresh}
                    />
                </Form>
            </Dialog>
        </>
    );
};

export const AddReferenceButton: React.FC<{
    reference: string;
    Component: MutateForm;
    onRefresh: () => void;
}> = ({ reference, Component, onRefresh }) => {
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
                        onRefresh={onRefresh}
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
    const { mutate, isLoading } = useMutation(
        () =>
            dataProvider.trim(
                resource,
                {},
            ),
        {
            onSuccess: () => {
                refresh();
                notify(`Trimming of ${resource} fields succeeded.`);
            },
            onError: (error) => notify(`Error: ${error}`, { type: 'warning' }),
        },
    );
    return (
        <Button
            label={`Trim ${resource} fields`}
            onClick={() => mutate()}
            disabled={isLoading}
        />
    );
};
