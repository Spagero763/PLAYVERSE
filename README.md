# 🚀 PlayVerse: Multiplayer + AI Game Hub

Welcome to **PlayVerse**, your ultimate destination for competitive multiplayer and challenging AI-powered games. Built with modern web technologies, PlayVerse offers a seamless and engaging gaming experience right in your browser.

## ✨ Features

- **Diverse Game Library:** Jump into classic and new games, including Tic Tac Toe, Chess, Ping Pong, and more.
- **Multiple Game Modes:** Challenge friends in real-time multiplayer, play solo, or test your skills against our advanced AI opponents with varying difficulty levels.
- **Player Profiles & Progression:** Create your unique player profile using a Web3 wallet, earn XP, unlock badges, and track your gameplay statistics over time.
- **Live Leaderboards:** Climb the ranks and see how you stack up against the competition in a global leaderboard.
- **Sleek & Responsive UI:** Enjoy a beautiful, modern interface that works seamlessly across desktop and mobile devices.

## 🛠️ Tech Stack

PlayVerse is built on a modern, robust tech stack designed for performance and scalability:

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS with ShadCN/UI for components.
- **Web3 Integration:** `wagmi` and `viem` for seamless EVM wallet connectivity.
- **Monad Integration:** Configured Monad testnet chain for Web3 connectivity.

## ⚙️ How PlayVerse Works

PlayVerse provides a seamless gaming experience with Web3 wallet integration for user authentication and profile management.

### Architecture at a glance
- **Frontend**: Next.js + Tailwind + shadcn/ui; wallet via `wagmi`/`viem`.
- **Chain**: Monad testnet configuration in `src/lib/web3.ts` with env‑driven RPC/ID.
- **AI Integration**: Google's Genkit for AI-powered features and yield optimization.

### Getting Started
1. Connect your Web3 wallet to create your gaming profile.
2. Browse the game library and select a game to play.
3. Challenge friends in multiplayer mode or test your skills against AI opponents.
4. Track your progress and climb the leaderboards.

### Safety and UX
- Secure wallet-based authentication.
- Responsive design works seamlessly across all devices.
- All network/URLs are env‑driven for smooth testnet demos.

## Web3 Integration

## E2E smoke tests (Playwright)
Playwright E2E tests were included during development but have been intentionally disabled for the MVP production rollout to keep build dependencies small and speed up CI. If you want to re-enable browser E2E tests later, re-add `@playwright/test`, `playwright`, recreate `playwright.config.ts`, and restore the workflow `.github/workflows/e2e.yml`.

I also added a GitHub Action (`.github/workflows/e2e.yml`) that runs the smoke suite when manually triggered — pass the Vercel preview URL when you dispatch the workflow.

### Deploy & Vercel Notes
- Make sure to set environment variables in Vercel (see `.env.example`). Preferred contract address vars:
  - `NEXT_PUBLIC_CONTRACT_ADDRESS_BASE` (or legacy `NEXT_PUBLIC_PLAYVERSE_STAKE_BASE`)
  - `NEXT_PUBLIC_CONTRACT_ADDRESS_CELO` (or legacy `NEXT_PUBLIC_PLAYVERSE_STAKE_CELO`)
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - Optional RPCs: `NEXT_PUBLIC_BASE_RPC_URL`, `NEXT_PUBLIC_CELO_RPC_URL`

- Build on Vercel: Vercel runs `npm run build` by default. Ensure the env vars are present in the Vercel dashboard for Preview and Production.

- Deploying contracts with Hardhat:
  - Add `PRIVATE_KEY`, `BASE_RPC_URL`, `CELO_RPC_URL`, and `ETHERSCAN_API_KEY` (or `CELO_BLOCKSCOUT_API_KEY`) to your CI secrets/environment.
  - Run locally (example):
    - `npm run deploy:base` (deploy to Base network)
    - `cross-env VERIFY=true npm run deploy:base` (deploy + attempt on-chain verification)
  - CI: a manual GitHub Action `Deploy Contract` workflow has been added (`.github/workflows/deploy.yml`) — use it to dispatch a deploy to `base` or `celo` and it will use repository secrets.

---

## Contract verification

If you want to verify your contract onchain after deployment you can:

1. Use the verify flag in the deploy script during deploy (via `VERIFY=true`). Example:

```bash
cross-env PRIVATE_KEY=$PRIVATE_KEY BASE_RPC_URL=$BASE_RPC_URL ETHERSCAN_API_KEY=$ETHERSCAN_API_KEY VERIFY=true npm run deploy:base
```

2. Or run the Hardhat verify command manually after obtaining the deployed address:

```bash
npx hardhat verify --network base <DEPLOYED_ADDRESS>
```

For Celo you can use the `CELO_BLOCKSCOUT_API_KEY` (or the appropriate explorer API) similarly when running the verify step.

---

1. Set env vars in `.env.local` for local dev/test:
   - `NEXT_PUBLIC_MONAD_RPC_URL` (Monad testnet RPC)
   - `NEXT_PUBLIC_MONAD_CHAIN_ID=10143` (or your chain id)

2. Run the app:
```bash
npm run dev
```

3. Connect your wallet and start gaming!

- **Generative AI:** Google's Genkit for AI-powered features.

This project serves as a comprehensive example of a full-stack, feature-rich web application that combines gaming, Web3 identity, and artificial intelligence.