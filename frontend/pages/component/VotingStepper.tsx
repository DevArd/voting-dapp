import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Divider } from '@mui/material';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { votingContract } from '../Voting';
import SnackBarAlert from './SnackBarAlert';

const steps = [
    {
        label: 'Registering voters',
        description: `Add a voter in 'voters'. Only owner. Emit VoterRegistered. Should be called only once for each voter and when workflowStatus is RegisteringVoters.`,
    },
    {
        label: 'Proposals registration started',
        description:
            'Add proposal of \'msg.sender\' in \'proposals\'. Only voters. Emit ProposalRegistered. Should be called only when workflowStatus is ProposalsRegistrationStarted no empty description allowed.',
    },
    {
        label: 'Proposals registration ended',
        description: `The registration phase ended and we are waiting the voting session.`,
    },
    {
        label: 'Voting session started',
        description: `Set the vote of 'msg.sender'. Only voters. Emit Voted. Should be called only when workflowStatus is VotingSessionStarted. Should be called only once for each voter and for a registered proposal.`,
    },
    {
        label: 'Voting session ended',
        description: `The voting phase ended. Everybody can see the winning proposal. Should be called only when workflowStatus is VotingSessionEnded.`,
    },
];

interface VotingStepperProps {
    currentStepId: number;
    isOwner: boolean;
    handleStepChanged: any;
}

const getNextStep = (currentStepId: number) => {
    switch (currentStepId) {
        case 0:
            return { contractName: "startProposalsRegistering", nextStepId: currentStepId + 1 };
        case 1:
            return { contractName: "endProposalsRegistering", nextStepId: currentStepId + 1 };
        case 2:
            return { contractName: "startVotingSession", nextStepId: currentStepId + 1 };
        case 3:
            return { contractName: "endVotingSession", nextStepId: currentStepId + 1 };
        default:
            return { contractName: "startProposalsRegistering", nextStepId: 1 };
    }
}

const VotingStepper = ({ currentStepId, handleStepChanged, isOwner }: VotingStepperProps) => {
    const [alerted, setAlerted] = useState(false);

    const handleNext = () => {
        write?.();
    };

    const nextPhase = getNextStep(currentStepId)

    const {
        config
    } = usePrepareContractWrite({
        ...votingContract,
        functionName: nextPhase.contractName,
        enabled: currentStepId === nextPhase.nextStepId - 1,
    })

    const { data, error, isError, write } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    })

    useEffect(() => {
        if (isLoading || isError || isSuccess) {
            setAlerted(true);
        }
        if (isSuccess) {
            handleStepChanged();
        }
    }, [isLoading, isError, isSuccess]);

    const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        setAlerted(false);
    };

    return (
        <Box sx={{ maxWidth: 400, padding: 2 }}>
            <hr></hr>
            <h1>Voting steps</h1>
            <Stepper activeStep={currentStepId} orientation="vertical" sx={{ padding: 2 }}>
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel
                            optional={
                                index === steps.length ? (
                                    <Typography variant="caption">Last step</Typography>
                                ) : null
                            }
                        >
                            {step.label}
                        </StepLabel>
                        <StepContent>
                            <Typography>{step.description}</Typography>
                            {index === steps.length - 1 || !isOwner ? <></> : <Box sx={{ mb: 2 }}>
                                <div>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </Box>}
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            <Divider />
            <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`Successfully gone on next step with transaction ${data?.hash}`} onClose={handleClose}></SnackBarAlert>
        </Box>
    );
}

export default VotingStepper