
import EditIcon from '@mui/icons-material/Edit';
import {
    Dialog,
    DialogTitle,
    Button as MuiButton,
    Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { Button, Form, type Identifier, TextInput, type TextInputProps, useChoicesContext, useNotify, useRefresh } from 'react-admin';
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

export const CustomFormButton: React.FC<{
    action: string;
    description: string;
    Component: MutateForm;
    parentId?: Identifier;
}> = ({ action, description, Component }) => {
    const [showDialog, setShowDialog] = React.useState(false);

    return (
        <>
            <Button
                onClick={() => setShowDialog(true)}
                label={action}
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
                <DialogTitle>{description}</DialogTitle>
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

interface ControllerInputProps extends TextInputProps {
    property: string;
}

export const ControlledInput = ({
    source,
    property,
    ...rest
}: ControllerInputProps) => {
    const { selectedChoices } = useChoicesContext();

    return (
        selectedChoices && (
            <TextInput
                source={source}
                disabled={!!selectedChoices[0]}
                defaultValue={selectedChoices[0]?.[property]}
                {...rest}
            />
        )
    );
};