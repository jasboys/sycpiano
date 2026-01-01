import type { QueryObserverResult } from '@tanstack/react-query';
import axios from 'axios';
import { atom, type WritableAtom } from 'jotai';
import { atomWithQuery } from 'jotai-tanstack-query';
import type { PhotoItem } from 'src/components/Media/Photos/types';

const photosAtom: WritableAtom<
    QueryObserverResult<PhotoItem[], Error>,
    [],
    void
> = atomWithQuery<PhotoItem[]>(() => ({
    queryKey: ['photos'],
    queryFn: async () => {
        const { data } = await axios.get<PhotoItem[]>('/api/photos');
        return data;
    },
}));

export const photoAtoms = {
    photos: photosAtom,
    background: atom('rgb(248 248 248)'),
    currentItem: atom<PhotoItem>(),
};
