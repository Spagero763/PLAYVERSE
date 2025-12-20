import hre from 'hardhat';

async function main() {
  const networkName = hre.network.name;
  console.log(`Deploying to network: ${networkName}`);

  const Playverse = await hre.ethers.getContractFactory('PlayverseStake');
  const playverse = await Playverse.deploy();
  await playverse.waitForDeployment();

  const addr = await playverse.getAddress();
  console.log('PlayverseStake deployed to:', addr);

  // Optionally verify on the explorer if VERIFY=true and an API key is present
  if (process.env.VERIFY === 'true') {
    try {
      console.log('Attempting verification...');
      await hre.run('verify:verify', {
        address: addr,
        constructorArguments: [],
      });
      console.log('Verification submitted');
    } catch (e: any) {
      console.warn('Verification error:', e?.message || e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});