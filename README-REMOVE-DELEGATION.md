This repository includes a script to fully remove delegation, envio, and agents features.

How to run locally (PowerShell):

1. From the repository root:
   Set-Location 'C:\Users\user\Downloads\PLAYVERSE-main'
2. Run the removal script:
   .\scripts\remove-delegation.ps1

This will delete the following directories (if present):
- src/components/delegations
- src/app/delegations
- src/app/api/delegations
- src/lib/envio
- src/lib/delegation
- src/app/agents

After running the script you should run:

   npm install
   npm run typecheck
   npm run build

If you want me to perform the deletions directly here, I can attempt another pass; however the scripted approach is the most reliable for your local environment.
