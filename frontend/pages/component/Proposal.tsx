import { useContractRead } from 'wagmi';
import { votingContract } from '../Voting';
import React from 'react'
import { Avatar, Chip } from '@mui/material';

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
                isSuccess ? <Chip key={proposalId} style={{ fontWeight: "bolder"}} avatar={<Avatar>{proposalId}</Avatar>} color="primary" label={`${(data as any)?.description}`} /> : <></>
            }
        </>
    )
}

export default Proposal