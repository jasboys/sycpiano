
import EditIcon from '@mui/icons-material/Edit.js';
import {
    Dialog,
    DialogTitle,
    Button as MuiButton,
    Typography,
} from '@mui/material';
import React from 'react';
import { Button, Form } from 'react-admin';
import { MutateForm } from 'src/types.js';

export const Empty = ({ assoc }: { assoc: string }) => (
    <Typography>No associated {assoc} found.</Typography>
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