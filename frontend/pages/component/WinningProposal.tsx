import { Avatar, Chip, Divider, Stack } from '@mui/material'
import React from 'react'
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
          <Stack spacing={2}>
            <h3>The winning proposal is</h3>
            <Chip color="success" avatar={<Avatar>{proposalId}</Avatar>} style={{ fontWeight: "bolder" }} label={`${(data as any)?.description} with ${(data as any)?.voteCount} votes !`} />
            <Divider />
          </Stack>
          : <></>
      }
    </>
  )
}

export default WinningProposal