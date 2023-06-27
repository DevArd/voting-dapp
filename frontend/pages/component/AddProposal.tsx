import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React, { useState } from 'react'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { abi, contract } from '../../Constant';

const AddProposal = () => {

  const [proposal, setProposal] = useState('');

  const {
    config,
    error: prepareError,
    isError: isPrepareError
  } = usePrepareContractWrite({
    address: contract,
    abi: abi,
    functionName: 'addProposal',
    args: [proposal],
    enabled: Boolean(proposal),
  })

  const { data, error, isError, write } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

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
    </Stack>
  )
}

export default AddProposal