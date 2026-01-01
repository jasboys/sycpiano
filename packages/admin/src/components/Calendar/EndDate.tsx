import type { SxProps, Theme } from '@mui/material';
import React from 'react';
import { TextInput } from 'react-admin';
import { useFormContext, useWatch } from 'react-hook-form';

export const EndDate = ({ sx }: { sx?: SxProps<Theme> }) => {
    const allDay = useWatch({ name: 'allDay' });
    const { setValue, resetField } = useFormContext();

    React.useEffect(() => {
        if (allDay === false) {
            setValue('endDate', null);
            resetField('endDate');
        }
    }, [allDay]);

    return <TextInput source="endDate" disabled={!allDay} sx={sx} />;
};
