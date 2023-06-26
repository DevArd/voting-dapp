import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React from 'react'
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

const AddProposal = () => {
  return (
    <Stack spacing={2} >
      <h3>Add proposal</h3>
      <Stack sx={{ maxWidth: 400 }} direction="row" >
        <TextField
          id="outlined-multiline-flexible"
          label="Proposal description"
          multiline
          maxRows={4}
        />
        <IconButton size="large" color="primary">
          <PlaylistAddIcon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
    </Stack>
  )
}

export default AddProposal