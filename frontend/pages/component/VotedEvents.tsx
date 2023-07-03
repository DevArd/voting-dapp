import { votingContract } from '../Voting';
import { useContractEvent } from 'wagmi';
import React, { useEffect, useState } from 'react'
import { Chip, Divider, Stack } from '@mui/material';

interface Voted {
    proposalId: number;
    voter: string;
}

function VotedEvents() {
    const [votedList, setVotedList] = useState<Voted[]>([]);
    const [, setMyTime] = useState(new Date());

    useContractEvent({
        ...votingContract,
        eventName: 'Voted',
        listener(log) {
            const voted: Voted = {
                proposalId: (log[0] as any).args.proposalId,
                voter: (log[0] as any).args.voter
            }
            if (votedList.find(x => x.voter === voted.voter) === undefined) {
                let tempList = votedList;
                tempList.push(voted)
                setVotedList(tempList)
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
                votedList.length > 0 ?
                    <Stack spacing={1}>
                        <h3>Votes</h3>
                        {
                            votedList.length > 0 ? votedList.map((voted, index) => <Chip key={index} style={{ fontWeight: "bolder" }} color="primary" label={`${voted.voter} voted for proposal ${voted.proposalId}`} />) : <></>
                        }
                        <Divider />
                    </Stack> : <></>
            }
        </>
    )
}

export default VotedEvents