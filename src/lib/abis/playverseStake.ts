export const PLAYVERSE_STAKE_ABI = [
  "function placeStake(bytes32 gameId) payable",
  "function resolveGame(bytes32 gameId, bool playerWon)",
  "function refundStake(bytes32 gameId)",
  "function withdrawFees(address to)",
  "function setFeeBps(uint256 _feeBps)",
  "function setTimeout(uint256 _timeout)",
  "function stakes(bytes32) view returns (address player, uint256 amount, uint256 timestamp, bool claimed)",
  "function timeout() view returns (uint256)",
  "function feeBps() view returns (uint256)",
  "function owner() view returns (address)",
  "event StakePlaced(bytes32 indexed gameId, address indexed player, uint256 amount)",
  "event GameResolved(bytes32 indexed gameId, address indexed player, bool playerWon, uint256 payout, uint256 fee)",
  "event Refunded(bytes32 indexed gameId, address indexed player, uint256 amount)",
  "event FeeWithdrawn(address indexed to, uint256 amount)"
] as const;

export default PLAYVERSE_STAKE_ABI;
