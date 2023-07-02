import React, { useEffect, useState } from 'react'
import AddProposal from './component/AddProposal'
import AddVoter from './component/AddVoter'
import GetWinningProposal from './component/GetWinningProposal'
import SetVote from './component/SetVote'
import VotingStepper from './component/VotingStepper'
import { useAccount, useContractReads } from 'wagmi'
import { votingAbi, contract } from '../Constant';
import { getAddress } from 'viem'
import SnackBarAlert from './component/SnackBarAlert'
import VoterRegisteredEvents from './component/VoterRegisteredEvents'
import ProposalRegisteredEvents from './component/ProposalRegisteredEvents'

export const votingContract = {
    address: contract,
    abi: votingAbi,
}

function Voting() {
    const [alerted, setAlerted] = useState(false);
    const { address } = useAccount();
    const [activeStep, setActiveStep] = useState(0);
    const [isOwner, setIsOwner] = useState(false);
    const [isVoter, setIsVoter] = useState(false);
    const [winningProposalId, setWinningProposalId] = useState(0);

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
            setAlerted(true)
        }
        if (data?.[0].status === "success") {
            const isActiveAddressContractOwner = getAddress(`${data?.[0].result}`) === address
            setIsOwner(isActiveAddressContractOwner)
        }
        if (data?.[1].status === "success") {
            const currentStepId = parseInt(`${data?.[1].result}`)
            if (currentStepId > activeStep) {
                console.log('currentStepId', currentStepId)
                setActiveStep(currentStepId);
            }
        }
        if (data?.[2].status === "success") {
            const proposalId = parseInt(`${data?.[2].result}`)
            setWinningProposalId(proposalId)
        }
        if (data?.[3].status === "success") {
            const isActiveAddressVoter = (data?.[3].result as any)?.isRegistered
            setIsVoter(isActiveAddressVoter)
        }
        console.log('local data', isOwner, activeStep, winningProposalId, isVoter);
        console.log('data', data, isError, error, isLoading, isSuccess);

    }, [data, activeStep, address, error, isError, isLoading, isOwner, isSuccess, isVoter, winningProposalId]);

    const handleStepChanged = () => {
        console.log('newstep', activeStep + 1)
        setActiveStep(activeStep + 1)
    };

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        setAlerted(false);
    };

    return (
        <>
            <VotingStepper currentStepId={activeStep} handleStepChanged={() => handleStepChanged()} isOwner={isOwner} />
            {activeStep === 0 && isOwner ? <AddVoter /> : <></>}
            {activeStep === 1 && isVoter ? <AddProposal /> : <></>}
            {activeStep === 3 && isVoter ? <SetVote /> : <></>}
            {activeStep === 4 ? <GetWinningProposal /> : <></>}
            <VoterRegisteredEvents />
            {activeStep >= 1 ? <ProposalRegisteredEvents /> : <></>}

            <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`All contract data successfully retrieve`} onClose={handleClose}></SnackBarAlert>
        </>
    )
}

export default Voting