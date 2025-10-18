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

1. Set env vars in `.env.local`:
   - `NEXT_PUBLIC_MONAD_RPC_URL` (Monad testnet RPC)
   - `NEXT_PUBLIC_MONAD_CHAIN_ID=10143` (or your chain id)

2. Run the app:
```bash
npm run dev
```

3. Connect your wallet and start gaming!

- **Generative AI:** Google's Genkit for AI-powered features.

This project serves as a comprehensive example of a full-stack, feature-rich web application that combines gaming, Web3 identity, and artificial intelligence.