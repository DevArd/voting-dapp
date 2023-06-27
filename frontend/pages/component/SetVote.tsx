import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React, { useState } from 'react'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { abi, contract } from '../../Constant';

const SetVote = () => {
  const [proposalId, setProposalId] = useState('')

  const {
    config,
    error: prepareError,
    isError: isPrepareError
  } = usePrepareContractWrite({
    address: contract,
    abi: abi,
    functionName: 'setVote',
    args: [proposalId],
    enabled: parseInt(proposalId) >= 0,
  })

  const { data, error, isError, write } = useContractWrite(config)
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

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
    </Stack>
  )
}

export default SetVote