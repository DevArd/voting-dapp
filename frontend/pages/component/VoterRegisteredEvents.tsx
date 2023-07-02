import { votingContract } from '../Voting';
import { useContractEvent } from 'wagmi';
import React, { useEffect, useState } from 'react'
import { isAddress } from 'viem';
import { Chip, Divider, Stack } from '@mui/material';

function VoterRegisteredEvents() {
    const [voterList, setVotersList] = useState<string[]>([]);
    const [, setMyTime] = useState(new Date());

    useContractEvent({
        ...votingContract,
        eventName: 'VoterRegistered',
        listener(log) {
            const voterAddress = (log[0] as any).args.voterAddress;
            if (isAddress(voterAddress) && voterList.find(x => x === voterAddress) === undefined) {
                let tempList = voterList;
                tempList.push(voterAddress)
                setVotersList(tempList)
            }
        },
    })

    useEffect(() => {
        var timerID = setInterval(() => setMyTime(new Date()), 1000);
        return () => clearInterval(timerID);
    });

    return (
        <>
            {voterList.length > 0 ? <Stack spacing={1}>
                <h3>Voter's list</h3>
                {
                    voterList.length > 0 ? voterList.map((voteraddress, index) => <Chip key={index} style={{ fontWeight: "bolder"}} color="primary" label={voteraddress} />) : <></>
                }
                <Divider />
            </Stack> : <></>}
        </>
    )
}

export default VoterRegisteredEvents