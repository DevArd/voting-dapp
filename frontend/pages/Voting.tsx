import React, { useEffect, useState } from 'react'
import AddProposal from './component/AddProposal'
import AddVoter from './component/AddVoter'
import GetWinningProposal from './component/GetWinningProposal'
import SetVote from './component/SetVote'
import VotingStepper from './component/VotingStepper'
import { useAccount, useContractReads } from 'wagmi'
import { votingAbi, contract } from '../Constant';
import { SnackBarAlert } from './component/SnackBarAlert'

export const votingContract = {
    address: contract,
    abi: votingAbi,
}

function Voting() {
    const [alerted, setAlerted] = useState(false);
    const { address } = useAccount()

    const { data, isError, error, isLoading, isSuccess } = useContractReads({
        contracts: [
            {
                ...votingContract,
                functionName: 'owner',
            },
            {
                ...votingContract,
                functionName: 'workflowStatus',
            },
            {
                ...votingContract,
                functionName: 'winningProposalID',
            },
            {
                ...votingContract,
                functionName: 'getVoter',
                args: [`${address}`]
            },
        ],
    })

    console.log('data', data, isError, error, isLoading, isSuccess);

    useEffect(() => {
        if (isLoading || isError || isSuccess) {
            setAlerted(true);
        }
    }, [isLoading, isError, isSuccess]);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        setAlerted(false);
    };

    return (
        <>
            <VotingStepper initStepId={parseInt(`${data?.[1].result}`)} />
            <AddProposal />
            <AddVoter />
            <SetVote />
            <GetWinningProposal />
            <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`All contract data successfully retrieve`} onClose={handleClose}></SnackBarAlert>
        </>
    )
}

export default Voting