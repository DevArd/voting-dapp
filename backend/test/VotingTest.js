const { expect } = require('chai');

describe("Voting contract", function () {
  async function deployVotingFixture() {
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const voting = await ethers.deployContract("Voting");
    await voting.waitForDeployment();
    return { voting, owner, voter1, voter2, voter3 };
  }

  describe("Add Voters Phase", function () {
    it('Test on only Owner', async function () {
      const { voting, voter1 } = await deployVotingFixture();
      await expect(voting.connect(voter1).addVoter(voter1)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Add voter pass, test event", async function () {
      const { voting, owner, voter1 } = await deployVotingFixture();

      await expect(voting.connect(owner).addVoter(voter1))
        .to.emit(voting, "VoterRegistered")
        .withArgs(voter1.address);
    });

    it("Add voter pass, test isRegistered", async function () {
      const { voting, owner, voter1 } = await deployVotingFixture();
      await voting.connect(owner).addVoter(voter1)
      let VoterRegisteredBool = await voting.connect(voter1).getVoter(voter1)
      expect(VoterRegisteredBool.isRegistered).to.equal(true);
    });

    it("Add voter cant pass if wrong workflow ", async function () {
      const { voting, owner, voter1 } = await deployVotingFixture();
      await voting.connect(owner).startProposalsRegistering();
      await expect(voting.connect(owner).addVoter(voter1)).to.be.revertedWith("Voters registration is not open yet");
    });
  })

  describe("Add Proposal Phase", function () {
    async function deployVotingProposalFixture() {
      const { voting, owner, voter1, voter2, voter3 } = await deployVotingFixture();
      await voting.connect(owner).addVoter(voter1)
      await voting.connect(owner).addVoter(voter2)
      await voting.connect(owner).addVoter(voter3)
      return { voting, owner, voter1, voter2, voter3 };
    }

    it('Test on require: not proposal registration state revert', async function () {
      const { voting, voter1 } = await deployVotingProposalFixture();
      await expect(voting.connect(voter1).addProposal("voter1Proposal")).to.be.revertedWith("Proposals are not allowed yet");
    })

    it('Test on require: non voter cant propose', async function () {
      const { voting, owner } = await deployVotingProposalFixture();
      await voting.connect(owner).startProposalsRegistering()
      await expect(voting.connect(owner).addProposal("BadOwner")).to.be.revertedWith("You're not a voter");
    })

    it('Test on require: voter cant propose nothing', async function () {
      const { voting, owner, voter1 } = await deployVotingProposalFixture();
      await voting.connect(owner).startProposalsRegistering()
      await expect(voting.connect(voter1).addProposal("")).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    })

    it("Proposal pass, test on proposal description and getter getOneProposal", async function () {
      const { voting, owner, voter1 } = await deployVotingProposalFixture();
      await voting.connect(owner).startProposalsRegistering()
      await voting.connect(voter1).addProposal("proposalVoter1")
      const ID = 1;
      let voter1ProposalID = await voting.connect(voter1).getOneProposal(ID);
      expect(voter1ProposalID.description).to.be.equal("proposalVoter1");
    })

    it("Proposal pass, test on proposalRegistered event", async function () {
      const { voting, owner, voter1 } = await deployVotingProposalFixture();
      await voting.connect(owner).startProposalsRegistering()
      let receipt = await voting.connect(voter1).addProposal("proposalVoter1")
      const ID = 1;
      await expect(receipt)
        .to.emit(voting, "ProposalRegistered")
        .withArgs(ID);
    })

    it("1 Proposal pass, test on revert getter getOneProposal ID 1", async function () {
      const { voting, owner, voter1 } = await deployVotingProposalFixture();
      await voting.connect(owner).startProposalsRegistering()
      await voting.connect(voter1).addProposal("proposalVoter1")
      const ID = 2;
      await expect(voting.connect(voter1).getOneProposal(ID)).to.be.reverted;
    })

    it("Multiple Proposal pass : concat", async function () {
      const { voting, owner, voter1, voter2, voter3 } = await deployVotingProposalFixture();
      await voting.connect(owner).startProposalsRegistering()
      await voting.connect(voter1).addProposal("proposalVoter1")
      await voting.connect(voter2).addProposal("proposalVoter2")
      await voting.connect(voter3).addProposal("proposalVoter3")

      let voter1ProposalID = await voting.connect(voter1).getOneProposal(1);
      let voter2ProposalID = await voting.connect(voter2).getOneProposal(2);
      let voter3ProposalID = await voting.connect(voter3).getOneProposal(3);

      expect(voter1ProposalID.description).to.be.equal("proposalVoter1");
      expect(voter2ProposalID.description).to.be.equal("proposalVoter2");
      expect(voter3ProposalID.description).to.be.equal("proposalVoter3");
    })
  })

  describe("Voting Phase", function () {
    async function deployVotingPhaseFixture() {
      const { voting, owner, voter1, voter2, voter3 } = await deployVotingFixture();
      await voting.connect(owner).addVoter(voter1)
      await voting.connect(owner).addVoter(voter2)
      await voting.connect(owner).addVoter(voter3)
      await voting.connect(owner).startProposalsRegistering()
      await voting.connect(voter1).addProposal("proposal 1")
      await voting.connect(voter2).addProposal("proposal 2")
      await voting.connect(owner).endProposalsRegistering()
      return { voting, owner, voter1, voter2, voter3 };
    }

    it('Test on require: vote cant be done if not in the right worfkflow status', async function () {
      const { voting, voter1 } = await deployVotingPhaseFixture();
      await expect(voting.connect(voter1).setVote(1)).to.be.revertedWith("Voting session havent started yet");
    })

    it('Concat : Test on requires: non voter cant propose, voter cant propose nothing, and voter cant vote twice', async function () {
      const { voting, owner, voter1 } = await deployVotingPhaseFixture();
      await voting.connect(owner).startVotingSession()
      await expect(voting.connect(owner).setVote(0)).to.be.revertedWith("You're not a voter");
      await expect(voting.connect(voter1).setVote(5)).to.be.revertedWith("Proposal not found");
      await voting.connect(voter1).setVote(1);
      await expect(voting.connect(voter1).setVote(2)).to.be.revertedWith("You have already voted");
    })

    it("vote pass: Voter 1 vote for proposal 1: Test on event", async function () {
      const { voting, owner, voter1 } = await deployVotingPhaseFixture();
      await voting.connect(owner).startVotingSession()
      let voteID = 1;

      let receipt = await voting.connect(voter1).setVote(voteID);
      await expect(receipt)
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, voteID);
    })

    it("vote pass: Voter 1 vote for proposal 1: Test on voter attributes", async function () {
      const { voting, owner, voter1 } = await deployVotingPhaseFixture();
      await voting.connect(owner).startVotingSession()
      let VoteID = 1;

      let voter1Objectbefore = await voting.connect(voter1).getVoter(voter1);
      expect(voter1Objectbefore.hasVoted).to.be.equal(false);

      await voting.connect(voter1).setVote(1);
      let voter1Object = await voting.connect(voter1).getVoter(voter1);

      expect(voter1Object.hasVoted).to.be.equal(true);
      expect(voter1Object.votedProposalId).to.be.equal(VoteID.toString());
    })

    it("vote pass: Voter 1 vote for proposal 1: Test on proposal attributes", async function () {
      const { voting, owner, voter1 } = await deployVotingPhaseFixture();
      await voting.connect(owner).startVotingSession()
      let VoteID = 1;

      await voting.connect(voter1).setVote(1);
      let votedProposalObject = await voting.connect(voter1).getOneProposal(VoteID);

      expect(votedProposalObject.description).to.be.equal("proposal 1");
      expect(votedProposalObject.voteCount).to.be.equal('1');
    })

    it("multiple vote pass: concat", async function () {
      const { voting, owner, voter1, voter2, voter3 } = await deployVotingPhaseFixture();
      await voting.connect(owner).startVotingSession()

      let receipt1 = await voting.connect(voter1).setVote(1);
      let receipt2 = await voting.connect(voter2).setVote(2);
      let receipt3 = await voting.connect(voter3).setVote(2);

      await expect(receipt1)
        .to.emit(voting, "Voted")
        .withArgs(voter1.address, 1);
      await expect(receipt2)
        .to.emit(voting, "Voted")
        .withArgs(voter2.address, 2);
      await expect(receipt3)
        .to.emit(voting, "Voted")
        .withArgs(voter3.address, 2);

      /////

      let voter1Object = await voting.connect(voter1).getVoter(voter1);
      let voter2Object = await voting.connect(voter1).getVoter(voter2);
      let voter3Object = await voting.connect(voter1).getVoter(voter3);

      expect(voter1Object.hasVoted).to.be.equal(true);
      expect(voter1Object.votedProposalId).to.be.equal(1);

      expect(voter2Object.hasVoted).to.be.equal(true);
      expect(voter2Object.votedProposalId).to.be.equal(2);

      expect(voter3Object.hasVoted).to.be.equal(true);
      expect(voter3Object.votedProposalId).to.be.equal(2);

      /////

      let votedProposalObject1 = await voting.connect(voter1).getOneProposal(1);
      let votedProposalObject2 = await voting.connect(voter2).getOneProposal(2);

      expect(votedProposalObject1.voteCount).to.be.equal('1');
      expect(votedProposalObject2.voteCount).to.be.equal('2');
    })
  })

  // Moove the _winningProposalId resolver to voting phase to avoid DoS Gas Limit attack.
  // describe("Tallying Phase", function () {
  //   async function deployVotingTallyingFixture() {
  //     const { voting, owner, voter1, voter2, voter3 } = await deployVotingFixture();
  //     await voting.connect(owner).addVoter(voter1)
  //     await voting.connect(owner).addVoter(voter2)
  //     await voting.connect(owner).addVoter(voter3)
  //     await voting.connect(owner).startProposalsRegistering()
  //     await voting.connect(voter1).addProposal("voter1Proposal")
  //     await voting.connect(voter2).addProposal("voter2Proposal")
  //     await voting.connect(voter3).addProposal("voter3Proposal")
  //     await voting.connect(owner).endProposalsRegistering()
  //     await voting.connect(owner).startVotingSession()
  //     await voting.connect(voter1).setVote(1)
  //     await voting.connect(voter2).setVote(2)
  //     await voting.connect(voter3).setVote(2)
  //     return { voting, owner, voter1, voter2, voter3 };
  //   }

  //   it('Test on require: tally vote cant be done if not in the right worfkflow status', async function () {
  //     const { voting, owner } = await deployVotingTallyingFixture();
  //     await expect(voting.connect(owner).tallyVotes()).to.be.revertedWith("Current status is not voting session ended");
  //   })

  //   it('Test on require: not the owner', async function () {
  //     const { voting, owner, voter1 } = await deployVotingTallyingFixture();
  //     await voting.connect(owner).endVotingSession()
  //     await expect(voting.connect(voter1).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner");
  //   })

  //   it('Tally pass, test on event on workflow status', async function () {
  //     const { voting, owner } = await deployVotingTallyingFixture();
  //     await voting.connect(owner).endVotingSession()
  //     let receipt = await voting.connect(owner).tallyVotes();
  //     await expect(receipt)
  //       .to.emit(voting, "WorkflowStatusChange")
  //       .withArgs(4, 5);
  //   })

  //   it('Tally pass, test on winning proposal description and vote count', async function () {
  //     const { voting, owner, voter1 } = await deployVotingTallyingFixture();
  //     await voting.connect(owner).endVotingSession()
  //     await voting.connect(owner).tallyVotes();
  //     let winningID = await voting.winningProposalID.call();
  //     let winningProposal = await voting.connect(voter1).getOneProposal(winningID);
  //     expect(winningProposal.description).to.equal('voter2Proposal');
  //     expect(winningProposal.voteCount).to.equal('2');
  //   })
  // })

  describe("Worfklow status tests", function () {
    // could do both test for every worflowStatus
    it('Generalisation: test on require trigger: not owner cant change workflow status', async function () {
      const { voting, voter2 } = await deployVotingFixture();
      await expect(voting.connect(voter2).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner");
    })

    it('Generalisation: test on require trigger: cant change to next next workflow status', async function () {
      const { voting, owner } = await deployVotingFixture();
      await expect(voting.connect(owner).endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet");
    })

    it("Test on event: start proposal registering", async () => {
      const { voting, owner } = await deployVotingFixture();
      let status = await voting.workflowStatus.call();
      expect(status).to.be.equal(0);
      let startProposal = await voting.connect(owner).startProposalsRegistering();
      await expect(startProposal)
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(0, 1);
    });

    it("Test on event: end proposal registering", async () => {
      const { voting, owner } = await deployVotingFixture();
      await voting.connect(owner).startProposalsRegistering();
      let endProposal = await voting.connect(owner).endProposalsRegistering();
      await expect(endProposal)
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(1, 2);
    });

    it("Test on event: start voting session", async () => {
      const { voting, owner } = await deployVotingFixture();
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(owner).endProposalsRegistering();
      let startVote = await voting.connect(owner).startVotingSession();
      await expect(startVote)
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(2, 3);
    });

    it("Test on event: end voting session", async () => {
      const { voting, owner } = await deployVotingFixture();
      await voting.connect(owner).startProposalsRegistering();
      await voting.connect(owner).endProposalsRegistering();
      await voting.connect(owner).startVotingSession();
      let endVote = await voting.connect(owner).endVotingSession();
      await expect(endVote)
        .to.emit(voting, "WorkflowStatusChange")
        .withArgs(3, 4);
    });
  })
})
