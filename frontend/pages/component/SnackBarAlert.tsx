import { Alert, Snackbar } from '@mui/material'
import React from 'react'

interface EthereumNotif {
  isSuccess: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  message: string;
  onClose?: any;
}

const SnackBarAlert = (notif: EthereumNotif) => {
  return (
    <>
      <Snackbar open={notif.isSuccess} autoHideDuration={6000} sx={{ maxWidth: '90%' }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} onClose={notif.onClose}>
        <Alert severity="success" onClose={notif.onClose}>
          {notif.message}
        </Alert>
      </Snackbar>
      <Snackbar open={notif.isLoading} autoHideDuration={6000} sx={{ maxWidth: '90%' }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} onClose={notif.onClose}>
        <Alert severity="info" onClose={notif.onClose}>
          Transaction sent...
        </Alert>
      </Snackbar>
      <Snackbar open={notif.isError} autoHideDuration={6000} sx={{ maxWidth: '90%' }} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} onClose={notif.onClose}>
        <Alert severity="error" onClose={notif.onClose}>
          Error: {notif.error?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default SnackBarAlert