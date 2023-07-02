import { Button, Chip, Divider, Stack } from '@mui/material'
import React, { useEffect } from 'react'
import { votingContract } from '../Voting'
import { useContractRead } from 'wagmi'

interface GetWinningProposalProps {
  proposalId: number;
}

const WinningProposal = ({ proposalId }: GetWinningProposalProps) => {

  const { data, isSuccess } = useContractRead({
    ...votingContract,
    functionName: 'getOneProposal',
    args: [proposalId]
  })

  return (
    <>
      {
        isSuccess ?
          <Stack>
            <h3>The winning proposal is</h3>
            <Chip color="success" label={`${proposalId} - ${(data as any)?.description} with ${(data as any)?.voteCount} votes !`} />
          </Stack>
          : <></>
      }
    </>
  )
}

export default WinningProposal