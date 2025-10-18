// Server-only module; do not import in client components.
/**
 * @fileOverview An AI agent that optimizes yield on Monad.
 *
 * - getYieldStrategy - A function that returns a yield optimization strategy.
 * - YieldOptimizerInput - The input type for the getYieldStrategy function.
 * - YieldOptimizerOutput - The return type for the getYieldStrategy function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Mock data for DeFi protocols on Monad
const mockProtocols = [
    { id: 'protocol-a-lending', name: 'AlphaLend', type: 'Lending', apy: 0.05, risk: 'low' as const },
    { id: 'protocol-b-staking', name: 'BetaStake', type: 'Staking', apy: 0.08, risk: 'medium' as const },
    { id: 'protocol-c-liquidity', name: 'GammaSwap', type: 'Liquidity Pool', apy: 0.12, risk: 'high' as const },
];

// 1. Define Tools
const getProtocolYields = ai.defineTool(
    {
        name: 'getProtocolYields',
        description: 'Retrieves current APYs and risk levels for available DeFi protocols on Monad.',
        inputSchema: z.object({}),
        outputSchema: z.array(z.object({
            id: z.string(),
            name: z.string(),
            type: z.string(),
            apy: z.number(),
            risk: z.enum(['low', 'medium', 'high']),
        })),
    },
    async () => {
        // In a real app, this would fetch live data from on-chain sources
        console.log("Tool: Fetching protocol yields...");
        return mockProtocols;
    }
);


// 2. Define Input and Output Schemas
export const YieldOptimizerInputSchema = z.object({
    riskProfile: z.enum(['conservative', 'balanced', 'aggressive']).describe("The user's risk tolerance."),
    currentPositions: z.array(z.object({
        protocolId: z.string(),
        amount: z.number(),
    })).describe("The user's current DeFi positions.")
});
export type YieldOptimizerInput = z.infer<typeof YieldOptimizerInputSchema>;

export const YieldOptimizerOutputSchema = z.object({
    recommendation: z.string().describe("A human-readable summary of the recommended strategy and the reasoning behind it."),
    actions: z.array(z.object({
        type: z.enum(['MOVE', 'STAKE', 'HOLD']),
        fromProtocol: z.string().optional(),
        toProtocol: z.string().optional(),
        amountPercentage: z.number().optional().describe("The percentage of assets to move/stake."),
    })).describe("The concrete list of actions to execute."),
});
export type YieldOptimizerOutput = z.infer<typeof YieldOptimizerOutputSchema>;


// 3. Define the Prompt
const yieldOptimizerPrompt = ai.definePrompt({
    name: 'yieldOptimizerPrompt',
    system: `You are the Monad Yield Sentinel, an expert DeFi strategist.
Your goal is to recommend the optimal yield farming strategy for a user based on their risk profile and current positions.
Use the 'getProtocolYields' tool to fetch the latest data on available protocols.
Analyze the user's current positions against the available yields.
Recommend a clear, actionable strategy. Prioritize safety and alignment with the user's risk tolerance.

- For 'conservative' users, prioritize established protocols with low-risk APYs.
- For 'balanced' users, suggest a mix of stable, low-risk options and some higher-yield, medium-risk options.
- For 'aggressive' users, focus on maximizing yield, even if it involves higher-risk protocols, but still avoid anything that looks like a scam.

Provide a concise justification for your recommendation. Formulate a series of actions to be taken.
If the current strategy is already optimal, recommend 'HOLD'.`,
    tools: [getProtocolYields],
    input: { schema: YieldOptimizerInputSchema },
    output: { schema: YieldOptimizerOutputSchema },
});


// 4. Define the Flow
const yieldOptimizerFlow = ai.defineFlow(
    {
        name: 'yieldOptimizerFlow',
        inputSchema: YieldOptimizerInputSchema,
        outputSchema: YieldOptimizerOutputSchema,
    },
    async (input) => {
        console.log("Flow: Running with input", input);
        const llmResponse = await yieldOptimizerPrompt(input);
        const output = llmResponse.output;
        if (!output) {
            throw new Error("The AI failed to generate a valid strategy.");
        }
        console.log("Flow: AI Recommended Output", output);
        return output;
    }
);


// 5. Define an exported wrapper function
export async function getYieldStrategy(input: YieldOptimizerInput): Promise<YieldOptimizerOutput> {
    return await yieldOptimizerFlow(input);
}
