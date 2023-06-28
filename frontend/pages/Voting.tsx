import React, { useEffect, useState } from 'react'
import AddProposal from './component/AddProposal'
import AddVoter from './component/AddVoter'
import GetWinningProposal from './component/GetWinningProposal'
import SetVote from './component/SetVote'
import VotingStepper from './component/VotingStepper'
import { useAccount, useContractReads } from 'wagmi'
import { votingAbi, contract } from '../Constant';
import { SnackBarAlert } from './component/SnackBarAlert'
import { getAddress } from 'viem'

export const votingContract = {
    address: contract,
    abi: votingAbi,
}

function Voting() {
    const [alerted, setAlerted] = useState(false);
    const { address } = useAccount();
    const [activeStep, setActiveStep] = useState(0);
    const [stepChanged, setStepChanged] = useState(false);

    let isOwner: boolean = false;
    let isVoter: boolean = false;
    let currentStepId: number = 0;
    let winningProposalId: number = 0;

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


    useEffect(() => {
        if (isLoading || isError || isSuccess) {
            setAlerted(true);
        }
        if (data?.[0].status === "success") {
            isOwner = getAddress(`${data?.[0].result}`) === address
        }
        if (data?.[1].status === "success") {
            currentStepId = parseInt(`${data?.[1].result}`)
            setActiveStep(currentStepId);
        }
        if (data?.[2].status === "success") {
            winningProposalId = parseInt(`${data?.[2].result}`)
        }
        if (data?.[3].status === "success") {
            isVoter = (data?.[3].result as any).isRegistered
        }
        console.log('local data', isOwner, currentStepId, winningProposalId, isVoter);
        console.log('data', data, isError, error, isLoading, isSuccess);

    }, [data]);

    useEffect(() => {
        if (stepChanged) {
            console.log('newstep', currentStepId + 1)
            setActiveStep(currentStepId + 1)
        }
        setStepChanged(false)
    }, [stepChanged]);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        setAlerted(false);
    };

    return (
        <>
            <VotingStepper initStepId={activeStep} onStepChanged={() => setStepChanged(true)} />
            {activeStep === 0 ? <AddVoter /> : <></>}
            {activeStep === 1 ? <AddProposal /> : <></>}
            {activeStep === 3 ? <SetVote /> : <></>}
            {activeStep === 4 ? <GetWinningProposal /> : <></>}
            <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`All contract data successfully retrieve`} onClose={handleClose}></SnackBarAlert>
        </>
    )
}

export default Voting