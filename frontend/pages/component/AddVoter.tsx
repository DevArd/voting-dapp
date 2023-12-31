import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { isAddress } from 'viem'
import { votingContract } from '../Voting';
import SnackBarAlert from './SnackBarAlert';

const AddVoter = () => {
  const [voter, setVoter] = useState('');
  const [alerted, setAlerted] = useState(false);

  const {
    config
  } = usePrepareContractWrite({
    ...votingContract,
    functionName: 'addVoter',
    args: [voter],
    enabled: isAddress(voter),
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
      <h3>Add voter</h3>
      <Stack direction="row" width={'100%'}>
        <TextField sx={{ width: "100%" }} id="outlined-basic" label="Voter address" value={voter} onChange={(e) => setVoter(e.target.value)} />
        <IconButton size="large" color="primary" disabled={!write} onClick={() => write?.()}>
          <PersonAddAlt1Icon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
      <SnackBarAlert isSuccess={isSuccess && alerted} isLoading={isLoading && alerted} isError={isError && alerted} error={error} message={`Voter successfully added on transaction ${data?.hash}`} onClose={handleClose}></SnackBarAlert>
    </Stack>
  )
}

export default AddVoter