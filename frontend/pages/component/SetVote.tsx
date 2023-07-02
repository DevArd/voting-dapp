import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { votingContract } from '../Voting';
import SnackBarAlert from './SnackBarAlert';

const SetVote = () => {
  const [proposalId, setProposalId] = useState<string>('')
  const [alerted, setAlerted] = useState(false);

  const isValidId = (value: string): boolean => {
    const intValue = parseInt(value);
    if (intValue > 0) {
      return true;
    }

    return false;
  };

  const {
    config
  } = usePrepareContractWrite({
    ...votingContract,
    functionName: 'setVote',
    args: [proposalId],
    enabled: isValidId(proposalId),
  })

  const { data, error, isError, write } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  useEffect(() => {
    if (isLoading || isError || isSuccess) {
      setAlerted(true);
    }
  }, [isLoading, isError, isSuccess]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    setAlerted(false);
  };

  return (
    <Stack spacing={2} >
      <h3>Set vote</h3>
      <Stack sx={{ maxWidth: 400 }} direction="row" >
        <TextField id="outlined-basic" sx={{ width: "100%" }} label="Proposal identifier" value={proposalId} onChange={(e) => setProposalId(e.target.value)} inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} />
        <IconButton size="large" color="primary" disabled={!isValidId(proposalId)} onClick={() => write?.()}>
          <PlaylistAddCheckIcon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
      <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`Vote successfully sent on transaction ${data?.hash}`} onClose={handleClose}></SnackBarAlert>
    </Stack>
  )
}

export default SetVote