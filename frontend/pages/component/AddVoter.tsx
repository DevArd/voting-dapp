import { Divider, IconButton, Stack, TextField } from '@mui/material'
import React from 'react'
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

const AddVoter = () => {
  return (
    <Stack spacing={2}>
      <h3>Add voter</h3>
      <Stack sx={{ maxWidth: 400 }} direction="row">
        <TextField id="outlined-basic" label="Voter address" />
        <IconButton size="large" color="primary">
          <PersonAddAlt1Icon fontSize="large" />
        </IconButton>
      </Stack>
      <Divider />
    </Stack>

  )
}

export default AddVoter