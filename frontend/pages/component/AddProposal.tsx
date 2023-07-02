import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { votingContract } from '../Voting';
import SnackBarAlert from './SnackBarAlert';

const AddProposal = () => {

  const [proposal, setProposal] = useState('');
  const [alerted, setAlerted] = useState(false);

  const {
    config
  } = usePrepareContractWrite({
    ...votingContract,
    functionName: 'addProposal',
    args: [proposal],
    enabled: Boolean(proposal),
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
      <h3>Add proposal</h3>
      <Stack sx={{ maxWidth: 400 }} direction="row" >
        <TextField
          id="outlined-multiline-flexible"
          label="Proposal description"
          value={proposal}
          onChange={(e) => setProposal(e.target.value)}
          multiline
          maxRows={4}
        />
        <IconButton size="large" color="primary" disabled={!write} onClick={() => write?.()}>
          <PlaylistAddIcon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
      <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`Proposal successfully added on transaction ${data?.hash}`} onClose={handleClose}></SnackBarAlert>
    </Stack>
  )
}

export default AddProposal