import { Alert, Divider, IconButton, Snackbar, Stack, TextField } from '@mui/material'
import React, { useState } from 'react'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { abi, contract } from '../../Constant';
import { isAddress } from 'viem'

const AddVoter = () => {
  const [voter, setVoter] = useState('')

  const {
    config,
    error: prepareError,
    isError: isPrepareError
  } = usePrepareContractWrite({
    address: contract,
    abi: abi,
    functionName: 'addVoter',
    args: [voter],
    enabled: isAddress(voter),
  })

  const { data, error, isError, write } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  if (isError) {
    console.log('error', error);
  }

  return (
    <Stack spacing={2}>
      <h3>Add voter</h3>
      <Stack sx={{ maxWidth: 400 }} direction="row">
        <TextField id="outlined-basic" label="Voter address" value={voter} onChange={(e) => setVoter(e.target.value)} />
        <IconButton size="large" color="primary" disabled={!write} onClick={() => write?.()}>
          <PersonAddAlt1Icon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
      {isSuccess && (
        <Snackbar autoHideDuration={6000}>
          <Alert severity="success" >
            Successfully transaction at <a href={`https://etherscan.io/tx/${data?.hash}`}>etherscan</a>
          </Alert>
        </Snackbar>
      )}
      {isLoading && (
        <Snackbar autoHideDuration={6000}>
          <Alert severity="info">
            Transaction send at <a href={`https://etherscan.io/tx/${data?.hash}`}>etherscan</a>
          </Alert>
        </Snackbar>
      )}
      {(isPrepareError || isError) && (
        <Snackbar autoHideDuration={6000}>
          <Alert severity="error" >
            Error: {(prepareError || error)?.message}
          </Alert>
        </Snackbar>
      )}
    </Stack>
  )
}

export default AddVoter