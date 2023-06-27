import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { SnackBarAlert } from './SnackBarAlert';
import { votingContract } from '../Voting';

const SetVote = () => {
  const [proposalId, setProposalId] = useState('')
  const [alerted, setAlerted] = useState(false);

  const {
    config
  } = usePrepareContractWrite({
    ...votingContract,
    functionName: 'setVote',
    args: [proposalId],
    enabled: parseInt(proposalId) >= 0,
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
        <TextField id="outlined-basic" label="Proposal identifier" value={proposalId} onChange={(e) => setProposalId(e.target.value)} />
        <IconButton size="large" color="primary" disabled={!write} onClick={() => write?.()}>
          <PlaylistAddCheckIcon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
      <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`Vote successfully sent on transaction ${data?.hash}`} onClose={handleClose}></SnackBarAlert>
    </Stack>
  )
}

export default SetVote