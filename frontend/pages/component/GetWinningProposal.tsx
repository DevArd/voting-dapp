import { Button, Divider, Stack } from '@mui/material'
import React from 'react'

const GetWinningProposal = () => {
  return (
    <Stack spacing={2} >
      <Stack sx={{ maxWidth: 400, mt: 2 }} direction="row" >
        <Button variant="contained">Reveal the winning proposal</Button>
        <h3></h3>
      </Stack>
      <Divider />
    </Stack>
  )
}

export default GetWinningProposal