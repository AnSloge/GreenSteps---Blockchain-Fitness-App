# Implementation Plan: GreenSteps Security Hardening

## Overview

This implementation plan breaks down the security hardening and project reorganization into discrete coding tasks. Each task builds on previous work and maintains all existing functionality.

## Tasks

- [ ] 1. Create environment variable configuration files
  - [x] 1.1 Create root `.env.example` with PRIVATE_KEY, AXIOM_RPC_URL, ETHERSCAN_API_KEY placeholders
    - _Requirements: 1.1, 1.3_
  - [x] 1.2 Create frontend `.env.example` with VITE_CONTRACT_ADDRESS, VITE_AXIOM_RPC_URL, VITE_CHAIN_ID placeholders
    - _Requirements: 1.2, 1.4_
  - [x] 1.3 Update root `.gitignore` to exclude `.env*`, `*.key`, `*.pem`, `secrets/`
    - _Requirements: 1.5_
  - [x] 1.4 Update frontend `.gitignore` to exclude `.env*` and `*.local` files
    - _Requirements: 1.6_

- [ ] 2. Remove console.log statements from frontend code
  - [x] 2.1 Remove debug console.log statements from Web3Connection.jsx, keep only console.error for errors
    - _Requirements: 2.1, 2.3, 2.4_
  - [x] 2.2 Remove debug console.log statements from App.jsx
    - _Requirements: 2.2_
  - [x] 2.3 Write property test to verify no console.log statements in frontend source files
    - **Property 1: Debug Console Log Removal**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 3. Implement React ErrorBoundary component
  - [x] 3.1 Create ErrorBoundary.jsx component with componentDidCatch and getDerivedStateFromError
    - _Requirements: 3.1_
  - [x] 3.2 Implement fallback UI with error message and retry button
    - _Requirements: 3.2_
  - [x] 3.3 Add error logging in componentDidCatch using console.error
    - _Requirements: 3.3_
  - [x] 3.4 Wrap critical sections in App.jsx with ErrorBoundary
    - _Requirements: 3.4_
  - [x] 3.5 Write unit tests for ErrorBoundary component
    - **Property 2: ErrorBoundary Fallback Display**
    - **Property 3: ErrorBoundary Error Logging**
    - **Validates: Requirements 3.2, 3.3**

- [ ] 4. Checkpoint - Verify frontend changes
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Reorganize project structure
  - [x] 5.1 Create `contracts/abi/` directory and move ABI file from "Contract information" folder
    - Rename abi.json to GreenStepsToken.json
    - _Requirements: 4.1_
  - [x] 5.2 Update frontend imports to reference new ABI location
    - Update contractABI.js or any files importing from old location
    - _Requirements: 4.5_
  - [x] 5.3 Create `/scripts` directory for deployment scripts
    - _Requirements: 4.2_
  - [x] 5.4 Remove unused Lock.js ignition module
    - Delete ignition/modules/Lock.js
    - _Requirements: 4.3_
  - [x] 5.5 Create `/frontend/src/hooks` directory for custom React hooks
    - _Requirements: 4.4_

- [ ] 6. Create documentation files
  - [x] 6.1 Create SECURITY.md with vulnerability reporting process, contact info, and response times
    - _Requirements: 5.1, 5.5_
  - [x] 6.2 Create DEPLOYMENT.md with production deployment checklist
    - _Requirements: 5.2_
  - [x] 6.3 Create CONTRIBUTING.md with contribution guidelines
    - _Requirements: 5.3_
  - [x] 6.4 Update README.md to remove hardcoded URLs and use environment variable references
    - Replace hardcoded Vercel URL with placeholder
    - _Requirements: 5.4_
  - [x] 6.5 Write property test to verify README contains no hardcoded deployment URLs
    - **Property 4: README Hardcoded URL Removal**
    - **Validates: Requirements 5.4**

- [ ] 7. Update Hardhat configuration
  - [x] 7.1 Add dotenv package and load environment variables in hardhat.config.js
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 7.2 Add Axiom Chain network configuration using process.env variables
    - _Requirements: 6.1, 6.2, 6.3_
  - [x] 7.3 Write property test to verify hardhat.config.js uses environment variables for sensitive values
    - **Property 5: Configurable Values Use Environment Variables**
    - **Validates: Requirements 10.2**

- [ ] 8. Create deployment script
  - [x] 8.1 Create scripts/deploy-greensteps.js deployment script
    - Include contract deployment logic
    - Add optional verification when ETHERSCAN_API_KEY is available
    - Output deployed contract address
    - Add error handling with informative messages
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 9. Update Vite configuration
  - [x] 9.1 Add build optimization settings to vite.config.js
    - Configure chunk splitting for vendor, mui, and ethers
    - Set sourcemap to false for production
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. Update package.json files
  - [x] 10.1 Update root package.json with proper description and author
    - _Requirements: 8.1, 8.2_
  - [x] 10.2 Add npm scripts for test, lint, and deploy to root package.json
    - Add "test": "hardhat test"
    - Add "deploy:axiom": "hardhat run scripts/deploy-greensteps.js --network axiom"
    - _Requirements: 8.3, 8.4_
  - [x] 10.3 Verify frontend package.json has proper build script
    - _Requirements: 8.5_

- [ ] 11. Final checkpoint - Run all tests and verify functionality
  - Run `npx hardhat test` to ensure all existing tests pass
  - Verify frontend builds successfully with `cd frontend && pnpm build`
  - _Requirements: 10.4_

## Notes

- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Smart contract logic is NOT modified - only deployment configuration
- All existing functionality must remain working
