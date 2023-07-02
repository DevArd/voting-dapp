import { votingContract } from '../Voting';
import { useContractEvent } from 'wagmi';
import React, { useEffect, useState } from 'react'
import { Divider, Stack } from '@mui/material';
import Proposal from './Proposal';

function ProposalRegisteredEvents() {
    const [proposalList, setProposalList] = useState<number[]>([]);
    const [, setMyTime] = useState(new Date());

    useContractEvent({
        ...votingContract,
        eventName: 'ProposalRegistered',
        listener(log) {
            const proposalId = parseInt((log[0] as any).args.proposalId);
            if (proposalList.find(x => x === proposalId) === undefined) {
                let tempList = proposalList;
                tempList.push(proposalId)
                setProposalList(tempList)
            }
        },
    })

    useEffect(() => {
        var timerID = setInterval(() => setMyTime(new Date()), 1000);
        return () => clearInterval(timerID);
    });

    return (
        <>
            {
                proposalList.length > 0 ? <Stack spacing={1}>
                    <h3>Proposal&apos;s list</h3>
                    {
                        proposalList.length > 0 ? proposalList.map((proposalId, index) => <Proposal proposalId={proposalId} key={index} />) : <></>
                    }
                    <Divider />
                </Stack> : <></>
            }
        </>
    )
}

export default ProposalRegisteredEvents