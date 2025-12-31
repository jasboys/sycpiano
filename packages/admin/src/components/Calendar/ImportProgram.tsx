import IconCancel from '@mui/icons-material/Cancel';
import { DialogActions, DialogContent } from '@mui/material';

import { useMutation } from '@tanstack/react-query';
import {
    AutocompleteInput,
    Button,
    type Identifier,
    type RaRecord,
    ReferenceInput,
    SaveButton,
    TextInput,
    useNotify,
    useRecordContext,
    useRefresh,
} from 'react-admin';
import { useFormContext } from 'react-hook-form';
import { useAppDataProvider } from '../../providers/restProvider.js';
import type { MutateForm } from '../../types.js';

const OptionRenderer = () => {
    const record:
        | {
              nickname: string;
              pieces: { composer: string; piece: string }[];
          }
        | undefined = useRecordContext();
    return (
        record && (
            <div css={{ fontSize: '0.8rem' }}>
                <span>{record.nickname}</span>
                <div css={{ paddingLeft: '0.5rem' }}>
                    {record.pieces.map(
                        (prog: { composer: string; piece: string }) => {
                            return (
                                <div key={`${prog.composer}-${prog.piece}`}>
                                    {`${prog.composer.split(' ').at(-1)}: ${prog.piece}`}
                                </div>
                            );
                        },
                    )}
                </div>
            </div>
        )
    );
};

export const ImportProgram: MutateForm = ({ setShowDialog }) => {
    const dataProvider = useAppDataProvider();
    const { handleSubmit } = useFormContext();

    const notify = useNotify();
    const record = useRecordContext();
    const refresh = useRefresh();

    const { mutate, isPending } = useMutation({
        mutationFn: (data: { calId: Identifier; progId: Identifier }) => {
            return dataProvider.importProgram('programs', data);
        },
        onSuccess: () => {
            setShowDialog(false);
            notify(
                `Successfully imported program from ${record?.programId} into ${record?.id}.`,
                {
                    type: 'success',
                    undoable: false,
                },
            );
            refresh();
        },
        onError: (error) => {
            notify(error.message, { type: 'error' });
        },
    });

    const onSubmit = async (values: Partial<RaRecord>) => {
        const { program } = values;
        record?.id &&
            mutate({
                calId: record.id,
                progId: program.id,
            });
    };

    return (
        record && (
            <>
                <DialogContent>
                    <TextInput
                        label="Calendar ID"
                        source="id"
                        defaultValue={record.id}
                        disabled
                        fullWidth
                    />
                    <ReferenceInput source="program.id" reference="programs">
                        <AutocompleteInput
                            fullWidth
                            source="program.id"
                            label="Search Programs"
                            filterToQuery={(searchText) => ({
                                q: searchText
                                    .replaceAll(/[:-]/g, '')
                                    .replaceAll(/\s+/g, ' '),
                            })}
                            optionText={<OptionRenderer />}
                            inputText={(record) => record.nickname}
                            shouldRenderSuggestions={(val: string) => {
                                return val.trim().length > 2;
                            }}
                            noOptionsText="No Results"
                        />
                    </ReferenceInput>
                </DialogContent>
                <DialogActions>
                    <Button
                        label="ra.action.cancel"
                        onClick={() => setShowDialog(false)}
                        disabled={isPending}
                    >
                        <IconCancel />
                    </Button>
                    <SaveButton
                        onClick={handleSubmit(onSubmit)}
                        type="button"
                        disabled={isPending}
                        alwaysEnable={true}
                    />
                </DialogActions>
            </>
        )
    );
};