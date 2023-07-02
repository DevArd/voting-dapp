import { useContractRead } from 'wagmi';
import { votingContract } from '../Voting';
import React from 'react'
import { Chip } from '@mui/material';

interface ProposalProps {
    proposalId: number
}

function Proposal({ proposalId }: ProposalProps) {
    const { data, isSuccess } = useContractRead({
        ...votingContract,
        functionName: 'getOneProposal',
        args: [proposalId]
    })

    return (
        <>
            {
                isSuccess ? <Chip key={proposalId} label={`${proposalId} - ${(data as any)?.description}`} /> : <></>
            }
        </>
    )
}

export default Proposal