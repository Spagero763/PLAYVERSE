// Simple test script: sign a sample Delegation typed data with a local test key
// and POST it to http://localhost:3000/api/agent/execute
import { signTypedData_v4 } from 'eth-sig-util';

const privKeyHex = '4f3edf983ac636a65a842ce7c78d9aa706d3b113b37b9c6f6d4c123456789abc'; // example/test key
const privateKey = Buffer.from(privKeyHex, 'hex');

const message = {
  owner: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
  delegate: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
  allowedTargets: [],
  startTime: Math.floor(Date.now() / 1000) - 60,
  endTime: Math.floor(Date.now() / 1000) + 3600,
  nonce: '0x' + '0'.repeat(64),
};

const typedData = {
  types: {
    EIP712Domain: [],
    Delegation: [
      { name: 'owner', type: 'address' },
      { name: 'delegate', type: 'address' },
      { name: 'allowedTargets', type: 'address[]' },
      { name: 'startTime', type: 'uint256' },
      { name: 'endTime', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
    ],
  },
  primaryType: 'Delegation',
  domain: { name: 'Playverse Delegation' },
  message,
};

const sig = signTypedData_v4(privateKey, { data: typedData });

const packet = { chainId: 10143, domainName: 'Playverse Delegation', verifyingContract: undefined, message, signature: sig };

async function run() {
  try {
    const port = process.env.TEST_PORT || process.env.PORT || '9002';
    const host = process.env.TEST_HOST || 'localhost';
    const url = `http://${host}:${port}/api/agent/execute`;
    const res = await fetch(url, { method: 'POST', body: JSON.stringify(packet), headers: { 'Content-Type': 'application/json' } });
    const j = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', j);
  } catch (err) {
    console.error('Request failed:', err);
  }
}

run();
