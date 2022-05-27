import * as React from 'react';
import styled from '@emotion/styled';

interface ClickListenerProps {
    onClick: () => void;
}

const ClickDiv = styled.div({
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
});

export const ClickListenerOverlay: React.FC<ClickListenerProps> = ({ onClick }) => {
    return (
        <ClickDiv onClick={onClick} />
    );
};