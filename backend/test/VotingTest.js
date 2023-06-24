const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

describe("Voting contract", function () {
  // We define a fixture to reuse the same setup in every test. We use
  // loadFixture to run this setup once, snapshot that state, and reset Hardhat
  // Network to that snapshot in every test.
  async function deployVotingFixture() {
    // Get the Signers here.
    const [owner, voter1, voter2, voter3] = await ethers.getSigners();

    // To deploy our contract, we just have to call ethers.deployContract and await
    // its waitForDeployment() method, which happens once its transaction has been
    // mined.
    const voting = await ethers.deployContract("Voting");

    await voting.waitForDeployment();

    // Fixtures can return anything you consider useful for your tests
    return { voting, owner, voter1, voter2, voter3 };
  }

  describe("Add Voters Phase", function () {
    it('Test on only Owner', async function () {
      const { voting, voter1 } = await deployVotingFixture();

      await expectRevert(voting.connect(voter1).addVoter(voter1),
        "Ownable: caller is not the owner")
    });

    it("Add voter pass, test event", async function () {
      const { voting, owner, voter1 } = await deployVotingFixture();
      let receipt =
        expectEvent(await voting.connect(owner).addVoter(voter1), "VoterRegistered");
    });

    it("Add voter pass, test isRegistered", async function () {
      const { voting, owner, voter1 } = await deployVotingFixture();
      await voting.connect(owner).addVoter(voter1)
      let VoterRegisteredBool = await voting.connect(voter1).getVoter(voter1)
      expect(VoterRegisteredBool.isRegistered).to.equal(true);
    });

    it("Add voter cant pass if wrong workflow ", async function () {
      const { voting, owner, voter1 } = await deployVotingFixture();
      await voting.connect(owner).startProposalsRegistering()
      await expectRevert(voting.connect(owner).addVoter(voter1),
        "Voters registration is not open yet")
    });

  })

  describe("Add Proposal Phase", function () {
    beforeEach(async function () {
      voting = await Voting.deploy({ from: owner });
      await voting.addVoter(voter1, { from: owner })
      await voting.addVoter(voter2, { from: owner })
      await voting.addVoter(voter3, { from: owner })

    })

    it('Test on require: not proposal registration state revert', async function () {
      await expectRevert(voting.addProposal("voter1Proposal", { from: voter1 }),
        "Proposals are not allowed yet")
    })

    it('Test on require: non voter cant propose', async function () {
      await voting.startProposalsRegistering({ from: owner })
      await expectRevert(voting.addProposal("BadOwner", { from: owner }),
        "You're not a voter")
    })

    it('Test on require: voter cant propose nothing', async function () {
      await voting.startProposalsRegistering({ from: owner })
      await expectRevert(voting.addProposal("", { from: voter2 }),
        "Vous ne pouvez pas ne rien proposer")
    })

    it("Proposal pass, test on proposal description and getter getOneProposal", async function () {
      await voting.startProposalsRegistering({ from: owner })
      await voting.addProposal("proposalVoter1", { from: voter1 })
      const ID = 1;
      let voter1ProposalID = await voting.getOneProposal(ID, { from: voter1 });
      expect(voter1ProposalID.description).to.be.equal("proposalVoter1");
    })

    it("Proposal pass, test on proposalRegistered event", async function () {
      await voting.startProposalsRegistering({ from: owner })
      let receipt = await voting.addProposal("proposalVoter1", { from: voter1 })
      const ID = 1;
      expectEvent(receipt, "ProposalRegistered", { proposalId: new BN(ID) });
    })

    it("1 Proposal pass, test on revert getter getOneProposal ID 1", async function () {
      await voting.startProposalsRegistering({ from: owner })
      await voting.addProposal("proposalVoter1", { from: voter1 })
      const ID = 2;
      await expectRevert.unspecified(voting.getOneProposal(ID, { from: voter1 }));
    })

    it("Multiple Proposal pass : concat", async function () {
      await voting.startProposalsRegistering({ from: owner })
      await voting.addProposal("proposalVoter1", { from: voter1 })
      await voting.addProposal("proposalVoter2", { from: voter2 })
      await voting.addProposal("proposalVoter3", { from: voter3 })

      let voter1ProposalID = await voting.getOneProposal(0, { from: voter1 });
      let voter2ProposalID = await voting.getOneProposal(1, { from: voter2 });
      let voter3ProposalID = await voting.getOneProposal(2, { from: voter3 });

      expect(voter1ProposalID.description).to.be.equal("proposalVoter1");
      expect(voter2ProposalID.description).to.be.equal("proposalVoter2");
      expect(voter3ProposalID.description).to.be.equal("proposalVoter3");
    })

  })

  describe("Voting Phase", function () {

    beforeEach(async function () {
      voting = await Voting.deploy({ from: owner });
      await voting.addVoter(voter1, { from: owner })
      await voting.addVoter(voter2, { from: owner })
      await voting.addVoter(voter3, { from: owner })
      await voting.startProposalsRegistering({ from: owner })
      await voting.addProposal("proposal 1", { from: voter1 })
      await voting.addProposal("proposal 2", { from: voter2 })
      await voting.endProposalsRegistering({ from: owner })
    })

    it('Test on require: vote cant be done if not in the right worfkflow status', async function () {
      await expectRevert(
        voting.setVote(1, { from: voter1 }),
        "Voting session havent started yet")
    })

    it('Concat : Test on requires: non voter cant propose, voter cant propose nothing, and voter cant vote twice', async function () {
      await voting.startVotingSession({ from: owner })
      await expectRevert(voting.setVote(0, { from: owner }),
        "You're not a voter")
      await expectRevert(voting.setVote(5, { from: voter1 }),
        "Proposal not found")
      await voting.setVote(1, { from: voter1 });
      await expectRevert(voting.setVote(2, { from: voter1 }),
        "You have already voted")
    })

    it("vote pass: Voter 1 vote for proposal 1: Test on event", async function () {
      await voting.startVotingSession({ from: owner })
      let VoteID = 1;

      let receipt = await voting.setVote(1, { from: voter1 });
      expectEvent(receipt, 'Voted', { voter: voter1, proposalId: new BN(VoteID) })
    })

    it("vote pass: Voter 1 vote for proposal 1: Test on voter attributes", async function () {
      await voting.startVotingSession({ from: owner })
      let VoteID = 1;

      let voter1Objectbefore = await voting.getVoter(voter1, { from: voter1 });
      expect(voter1Objectbefore.hasVoted).to.be.equal(false);

      await voting.setVote(1, { from: voter1 });
      let voter1Object = await voting.getVoter(voter1, { from: voter1 });

      expect(voter1Object.hasVoted).to.be.equal(true);
      expect(voter1Object.votedProposalId).to.be.equal(VoteID.toString());
    })

    it("vote pass: Voter 1 vote for proposal 1: Test on proposal attributes", async function () {
      await voting.startVotingSession({ from: owner })
      let VoteID = 1;

      await voting.setVote(1, { from: voter1 });
      let votedProposalObject = await voting.getOneProposal(VoteID, { from: voter1 });

      expect(votedProposalObject.description).to.be.equal("proposal 1");
      expect(votedProposalObject.voteCount).to.be.equal('1');
    })

    it("multiple vote pass: concat", async function () {
      await voting.startVotingSession({ from: owner })

      let receipt1 = await voting.setVote(1, { from: voter1 });
      let receipt2 = await voting.setVote(2, { from: voter2 });
      let receipt3 = await voting.setVote(2, { from: voter3 });

      expectEvent(receipt1, 'Voted', { voter: voter1, proposalId: new BN(1) })
      expectEvent(receipt2, 'Voted', { voter: voter2, proposalId: new BN(2) })
      expectEvent(receipt3, 'Voted', { voter: voter3, proposalId: new BN(2) })

      /////

      let voter1Object = await voting.getVoter(voter1, { from: voter1 });
      let voter2Object = await voting.getVoter(voter2, { from: voter1 });
      let voter3Object = await voting.getVoter(voter3, { from: voter1 });

      expect(voter1Object.hasVoted).to.be.equal(true);
      expect(new BN(voter1Object.votedProposalId)).to.be.bignumber.equal(new BN(1));

      expect(voter2Object.hasVoted).to.be.equal(true);
      expect(new BN(voter2Object.votedProposalId)).to.be.bignumber.equal(new BN(2));

      expect(voter3Object.hasVoted).to.be.equal(true);
      expect(new BN(voter3Object.votedProposalId)).to.be.bignumber.equal(new BN(2));


      /////

      let votedProposalObject1 = await voting.getOneProposal(1, { from: voter1 });
      let votedProposalObject2 = await voting.getOneProposal(2, { from: voter2 });

      expect(votedProposalObject1.voteCount).to.be.equal('1');
      expect(votedProposalObject2.voteCount).to.be.equal('2');

    })


  })

  describe("Tallying Phase", function () {

    beforeEach(async function () {
      voting = await Voting.deploy({ from: owner });
      await voting.addVoter(voter1, { from: owner })
      await voting.addVoter(voter2, { from: owner })
      await voting.addVoter(voter3, { from: owner })
      await voting.startProposalsRegistering({ from: owner })
      await voting.addProposal("voter1Proposal", { from: voter1 })
      await voting.addProposal("voter2Proposal", { from: voter2 })
      await voting.addProposal("voter3Proposal", { from: voter3 })
      await voting.endProposalsRegistering({ from: owner })
      await voting.startVotingSession({ from: owner })
      await voting.setVote(1, { from: voter1 })
      await voting.setVote(2, { from: voter2 })
      await voting.setVote(2, { from: voter3 })
    })

    it('Test on require: tally vote cant be done if not in the right worfkflow status', async function () {
      await expectRevert(
        voting.tallyVotes({ from: owner }),
        "Current status is not voting session ended")
    })

    it('Test on require: not the owner', async function () {
      await voting.endVotingSession({ from: owner })
      await expectRevert(
        voting.tallyVotes({ from: voter1 }),
        "Ownable: caller is not the owner")
    })

    it('Tally pass, test on event on workflow status', async function () {
      await voting.endVotingSession({ from: owner })
      let receipt = await voting.tallyVotes({ from: owner });
      expectEvent(receipt, 'WorkflowStatusChange', { previousStatus: new BN(4), newStatus: new BN(5) })

    })

    it('Tally pass, test on winning proposal description and vote count', async function () {
      await voting.endVotingSession({ from: owner })
      await voting.tallyVotes({ from: owner });
      let winningID = await voting.winningProposalID.call();
      let winningProposal = await voting.getOneProposal(winningID, { from: voter1 });
      expect(winningProposal.description).to.equal('voter2Proposal');
      expect(winningProposal.voteCount).to.equal('2');
    })
  })

  describe("Worfklow status tests", function () {

    beforeEach(async function () {
      voting = await Voting.deploy({ from: owner });
    })

    // could do both test for every worflowStatus
    it('Generalisation: test on require trigger: not owner cant change workflow status', async function () {
      await expectRevert(
        voting.startProposalsRegistering({ from: voter2 }),
        "Ownable: caller is not the owner")
    })

    it('Generalisation: test on require trigger: cant change to next next workflow status', async function () {
      await expectRevert(
        voting.endProposalsRegistering({ from: owner }),
        "Registering proposals havent started yet")
    })

    it("Test on event: start proposal registering", async () => {
      let status = await voting.workflowStatus.call();
      expect(status).to.be.bignumber.equal(new BN(0));
      let startProposal = await voting.startProposalsRegistering({ from: owner });
      expectEvent(startProposal, 'WorkflowStatusChange', { previousStatus: new BN(0), newStatus: new BN(1) });
    });

    it("Test on event: end proposal registering", async () => {
      await voting.startProposalsRegistering({ from: owner });
      let endProposal = await voting.endProposalsRegistering({ from: owner });
      expectEvent(endProposal, 'WorkflowStatusChange', { previousStatus: new BN(1), newStatus: new BN(2) });
    });

    it("Test on event: start voting session", async () => {
      await voting.startProposalsRegistering({ from: owner });
      await voting.endProposalsRegistering({ from: owner });
      let startVote = await voting.startVotingSession({ from: owner });
      expectEvent(startVote, 'WorkflowStatusChange', { previousStatus: new BN(2), newStatus: new BN(3) });
    });

    it("Test on event: end voting session", async () => {
      await voting.startProposalsRegistering({ from: owner });
      await voting.endProposalsRegistering({ from: owner });
      await voting.startVotingSession({ from: owner });
      let endVote = await voting.endVotingSession({ from: owner });
      expectEvent(endVote, 'WorkflowStatusChange', { previousStatus: new BN(3), newStatus: new BN(4) });
    });
  })
})
