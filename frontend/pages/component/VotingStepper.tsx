import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Divider } from '@mui/material';

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

const VotingStepper = () => {
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    return (
        <Box sx={{ maxWidth: 400, padding: 2 }}>
            <hr></hr>
            <h1>Voting steps</h1>
            <Stepper activeStep={activeStep} orientation="vertical" sx={{ padding: 2 }}>
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
                            <Box sx={{ mb: 2 }}>
                                <div>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        sx={{ mt: 1, mr: 1 }}
                                    >
                                        {index === steps.length - 1 ? 'Finish' : 'Continue'}
                                    </Button>
                                </div>
                            </Box>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            <Divider />
        </Box>
    );
}

export default VotingStepper