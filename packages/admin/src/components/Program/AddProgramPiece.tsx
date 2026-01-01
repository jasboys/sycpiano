import IconCancel from '@mui/icons-material/Cancel';
import { DialogActions, DialogContent } from '@mui/material';
import {
    AutocompleteInput,
    Button,
    type Identifier,
    NumberInput,
    type RaRecord,
    ReferenceInput,
    SaveButton,
    TextInput,
    useCreate,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import type { AdminError } from '../../types.js';
import { ControlledInput } from '../Shared.jsx';

export const AddProgramPieceForm: React.FC<{
    setShowDialog: (t: boolean) => void;
}> = ({ setShowDialog }) => {
    const record = useRecordContext();
    const [create, { isLoading }] = useCreate<
        RaRecord<Identifier>,
        AdminError
    >();
    const { handleSubmit } = useFormContext();
    const notify = useNotify();
    const refresh = useRefresh();

    const onSubmit = async (values: Partial<RaRecord>) => {
        record &&
            create(
                'program-pieces',
                {
                    data: {
                        programId: record.id,
                        order: values.order,
                        ...values.piece,
                    },
                },
                {
                    onSuccess: () => {
                        setShowDialog(false);
                        notify('Created program-piece.', {
                            type: 'success',
                        });
                        refresh();
                    },
                    onError: (error) => {
                        notify(error.message, { type: 'error' });
                    },
                },
            );
    };

    return (
        record && (
            <>
                <DialogContent>
                    <TextInput
                        label="Program ID"
                        source="id"
                        defaultValue={record.id}
                        disabled
                        fullWidth
                    />
                    <ReferenceInput source="piece.id" reference="pieces">
                        <AutocompleteInput
                            fullWidth
                            source="piece.id"
                            label="Existing Piece"
                            filterToQuery={(searchText) => ({
                                q: searchText
                                    .replaceAll(/[:-]/g, '')
                                    .replaceAll(/\s+/g, ' '),
                            })}
                            optionText={(record) =>
                                record
                                    ? `${record.composer}: ${record.piece}`
                                    : ''
                            }
                            shouldRenderSuggestions={(val: string) => {
                                return val.trim().length > 2;
                            }}
                            noOptionsText="No Results"
                        />
                        <ControlledInput
                            source="piece.composer"
                            property="composer"
                            fullWidth
                        />
                        <ControlledInput
                            source="piece.piece"
                            property="piece"
                            fullWidth
                        />
                    </ReferenceInput>
                    <NumberInput source="order" />
                </DialogContent>
                <DialogActions>
                    <Button
                        label="ra.action.cancel"
                        onClick={() => setShowDialog(false)}
                        disabled={isLoading}
                    >
                        <IconCancel />
                    </Button>
                    <SaveButton
                        onClick={handleSubmit(onSubmit)}
                        type="button"
                        disabled={isLoading}
                    />
                </DialogActions>
            </>
        )
    );
};
