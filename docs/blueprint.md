# **App Name**: PlayVerse

## Core Features:

- Multiplayer Game Selection: Allow users to choose from a selection of multiplayer games like Tic Tac Toe, Chess, Checkers, and Ping Pong.
- Single Player Game Selection: Offer a variety of single-player games, including AI opponents and solo games.
- AI Opponent Logic: Implement AI opponents for games like Tic Tac Toe, Chess (using Stockfish.js), Checkers, and Ping Pong.
- Real-time Multiplayer Matchmaking: Enable real-time matchmaking using Socket.io for pairing players in multiplayer games.
- Dynamic Game Loading: Dynamically load selected game components based on the route, supporting both PvP and AI logic.
- Leaderboard: Display a leaderboard with the top 10 players, ranked by wins.
- Profile Stats Generation: Use AI to provide users personalized insights based on game play to suggest ways they can improve their play or recommend games in the hub.

## Web3 Integration (Hackathon Scope)

- Monad testnet chain configured via `wagmi` + `viem` with env overrides.
- Web3 wallet integration for user authentication and profile management.
- AI-powered features using Google's Genkit for enhanced gaming experience.


## Style Guidelines:

- Primary color: Vibrant purple (#BE52F2) for a futuristic, energetic feel.
- Background color: Dark indigo (#1E0036), a desaturated variant of purple, for a sleek, modern look.
- Accent color: Electric blue (#52BFF2), an analogous color, to highlight interactive elements and create contrast.
- Headline font: 'Space Grotesk', a sans-serif with a modern, techy feel for headlines. Body font: 'Inter', a sans-serif for a clean, readable style.
- Utilize Lucide Icons with neon glow effects to match the futuristic aesthetic.
- Implement a responsive grid layout with glassmorphism panels for a sleek, organized interface.
- Use Framer Motion for smooth transitions, hover effects, and animated backgrounds like particles or galaxy effects.