import { expect } from 'chai';
import hre from 'hardhat';
const { ethers, network } = hre;
import { Contract } from 'ethers';
import crypto from 'crypto';

describe('PlayverseStake', function () {
  let Playverse: any;
  let playverse: Contract;
  let owner: any, player: any, other: any;

  beforeEach(async function () {
    [owner, player, other] = await ethers.getSigners();
    Playverse = await ethers.getContractFactory('PlayverseStake');
    playverse = await Playverse.deploy();
    await playverse.waitForDeployment();
  });

  it('should reject incorrect stake amounts', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    await expect(playverse.connect(player).placeStake(gameId, { value: 1 })).to.be.revertedWith('Invalid stake amount');
  });

  it('should allow placing a stake and emit event', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n; // 1 Gwei
    await expect(playverse.connect(player).placeStake(gameId, { value: stakeValue })).to.emit(playverse, 'StakePlaced').withArgs(gameId, player.address, stakeValue);
    const s = await playverse.stakes(gameId);
    expect(s.player.toLowerCase()).to.equal(player.address.toLowerCase());
  });

  it('should not allow staking the same game twice', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n;
    await playverse.connect(player).placeStake(gameId, { value: stakeValue });
    await expect(playverse.connect(player).placeStake(gameId, { value: stakeValue })).to.be.revertedWith('Game already staked');
  });

  it('owner can resolve game (player wins) and contract keeps fee', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n;
    await playverse.connect(player).placeStake(gameId, { value: stakeValue });

    const feeBps = await playverse.feeBps();
    const fee = (BigInt(stakeValue) * BigInt(Number(feeBps))) / BigInt(10000);
    const payout = BigInt(stakeValue) - fee;

    await expect(playverse.connect(owner).resolveGame(gameId, true)).to.emit(playverse, 'GameResolved');

    const contractAddress = await playverse.getAddress();
    const contractBal = await ethers.provider.getBalance(contractAddress);
    expect(contractBal).to.equal(fee);

    const s = await playverse.stakes(gameId);
    expect(s.claimed).to.equal(true);
  });

  it('owner can resolve game (player loses) and contract retains full stake', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n;
    await playverse.connect(player).placeStake(gameId, { value: stakeValue });

    await expect(playverse.connect(owner).resolveGame(gameId, false)).to.emit(playverse, 'GameResolved');

    const contractAddress = await playverse.getAddress();
    const contractBal = await ethers.provider.getBalance(contractAddress);
    expect(contractBal).to.equal(stakeValue);

    const s = await playverse.stakes(gameId);
    expect(s.claimed).to.equal(true);
  });

  it('non-owner cannot call resolveGame or withdrawFees', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n;
    await playverse.connect(player).placeStake(gameId, { value: stakeValue });

    await expect(playverse.connect(player).resolveGame(gameId, true)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(playverse.connect(player).withdrawFees(player.address)).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('player can refund after timeout', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n;
    await playverse.connect(player).placeStake(gameId, { value: stakeValue });

    // read timeout, advance time and mine
    const to = Number(await playverse.timeout());
    await network.provider.send('evm_increaseTime', [to + 10]);
    await network.provider.send('evm_mine');

    await expect(playverse.connect(player).refundStake(gameId)).to.emit(playverse, 'Refunded');

    const s = await playverse.stakes(gameId);
    expect(s.claimed).to.equal(true);
  });

  it('owner can withdraw fees', async function () {
    const gameId = '0x' + crypto.randomBytes(32).toString('hex');
    const stakeValue = 1_000_000_000n;
    // player loses => contract has full stake
    await playverse.connect(player).placeStake(gameId, { value: stakeValue });
    await playverse.connect(owner).resolveGame(gameId, false);

    const contractAddress = await playverse.getAddress();
    const contractBefore = await ethers.provider.getBalance(contractAddress);
    expect(contractBefore).to.equal(stakeValue);

    await expect(playverse.connect(owner).withdrawFees(owner.address)).to.emit(playverse, 'FeeWithdrawn');

    const contractAfter = await ethers.provider.getBalance(contractAddress);
    expect(contractAfter).to.equal(0n);
  });

  it('owner can set feeBps and timeout', async function () {
    await playverse.connect(owner).setFeeBps(200);
    expect(Number(await playverse.feeBps())).to.equal(200);

    await playverse.connect(owner).setTimeout(1000);
    expect(Number(await playverse.timeout())).to.equal(1000);
  });

  it('non-owner cannot set feeBps or timeout', async function () {
    await expect(playverse.connect(player).setFeeBps(200)).to.be.revertedWith('Ownable: caller is not the owner');
    await expect(playverse.connect(player).setTimeout(1000)).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
