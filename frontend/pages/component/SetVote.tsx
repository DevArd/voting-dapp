import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React from 'react'
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

const SetVote = () => {
  return (
    <Stack spacing={2} >
      <h3>Set vote</h3>
      <Stack sx={{ maxWidth: 400 }} direction="row" >
        <TextField id="outlined-basic" label="Proposal identifier" />
        <IconButton size="large" color="primary">
          <PlaylistAddCheckIcon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
    </Stack>
  )
}

export default SetVote