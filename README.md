# voting-dapp

## Optimisations
- Convert winningProposalID uint to uint8. 0 to 255. 256 proposals are more than enough. All proposalId parameters are converted to uint8.
- Calculate the winningProposalID in the voting phase to avoid DoS Gas Limit attack. Potential for loop problem with a lot of proposals.
- Add winningProposalID getter to retrieve the winning proposal.
- Remove tallyVotes function and VotesTallied phase from WorkflowStatus enum. No need.