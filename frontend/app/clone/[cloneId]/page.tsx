'use client';

import React from 'react';
import { Spinner } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { CycloneAddress, CycloneAbi } from '../../utils/constants';
import { CloneType, toClone} from '../../utils/types';
import Clone from '../../components/Clone';


const ClonePage = () => {
    const { cloneId  } = useParams<{ cloneId: string }>();

    const { data: clone_data } = useReadContract({
        address: CycloneAddress,
        abi: CycloneAbi,
        functionName: 'clones',
        args: [BigInt(cloneId)],
    });

    if (!clone_data) {
        return <Spinner />
    }

    const clone = toClone(clone_data as any) as CloneType;

    return (
        <Clone clone={clone} />
    )
};

export default ClonePage;