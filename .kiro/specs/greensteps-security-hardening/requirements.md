# Requirements Document

## Introduction

This document specifies the requirements for a comprehensive security hardening and project reorganization of the GreenSteps blockchain fitness application. The project involves improving security practices, reorganizing project structure, enhancing documentation, and improving code quality while maintaining all existing functionality.

## Glossary

- **GreenSteps**: The blockchain-based fitness rewards application
- **GRST**: GreenSteps Token, the ERC-20 token used for rewards
- **Axiom_Chain**: The blockchain network where GreenSteps is deployed
- **Environment_Variable**: Configuration values stored outside the codebase for security
- **Error_Boundary**: React component that catches JavaScript errors in child components
- **ABI**: Application Binary Interface for smart contract interaction
- **Hardhat**: Ethereum development environment for compiling, testing, and deploying contracts

## Requirements

### Requirement 1: Environment Variable Security

**User Story:** As a developer, I want proper environment variable management, so that sensitive credentials are never committed to version control.

#### Acceptance Criteria

1. THE System SHALL provide a `.env.example` file in the root directory containing all required environment variables with placeholder values
2. THE System SHALL provide a `.env.example` file in the frontend directory containing all required frontend environment variables with placeholder values
3. WHEN a developer clones the repository, THE System SHALL document PRIVATE_KEY, AXIOM_RPC_URL, and ETHERSCAN_API_KEY as required root environment variables
4. WHEN a developer clones the repository, THE System SHALL document VITE_CONTRACT_ADDRESS, VITE_AXIOM_RPC_URL, and VITE_CHAIN_ID as required frontend environment variables
5. THE Root_Gitignore SHALL exclude `.env*` files, `*.key` files, `*.pem` files, and `secrets/` directories
6. THE Frontend_Gitignore SHALL exclude `.env*` files and `*.local` files

### Requirement 2: Console Log Removal

**User Story:** As a developer, I want production code free of excessive logging, so that sensitive information is not exposed in browser consoles.

#### Acceptance Criteria

1. WHEN the Web3Connection component executes, THE System SHALL NOT output debug information to the browser console
2. WHEN the App component executes, THE System SHALL NOT output debug information to the browser console
3. THE Frontend_Code SHALL contain only error-level logging for critical failures that require developer attention
4. IF a console statement is necessary for error handling, THEN THE System SHALL use console.error instead of console.log

### Requirement 3: React Error Boundaries

**User Story:** As a user, I want the application to gracefully handle errors, so that a single component failure does not crash the entire application.

#### Acceptance Criteria

1. THE System SHALL provide an ErrorBoundary component that catches JavaScript errors in child components
2. WHEN an error occurs in a child component, THE ErrorBoundary SHALL display a user-friendly fallback UI
3. WHEN an error occurs, THE ErrorBoundary SHALL log the error details for debugging purposes
4. THE App component SHALL wrap critical sections with ErrorBoundary components

### Requirement 4: Project Structure Reorganization

**User Story:** As a developer, I want a well-organized project structure, so that I can easily navigate and maintain the codebase.

#### Acceptance Criteria

1. THE System SHALL rename the "Contract information" folder to "contracts/abi" following standard naming conventions
2. THE System SHALL create a `/scripts` directory for deployment scripts
3. THE System SHALL remove the unused Lock.js ignition module that is unrelated to GreenSteps
4. THE System SHALL create a `/frontend/src/hooks` directory for custom React hooks
5. WHEN the ABI file is relocated, THE System SHALL update all import references to the new location

### Requirement 5: Documentation Creation

**User Story:** As a contributor, I want comprehensive documentation, so that I can understand security practices, deployment procedures, and contribution guidelines.

#### Acceptance Criteria

1. THE System SHALL provide a SECURITY.md file documenting the vulnerability reporting process
2. THE System SHALL provide a DEPLOYMENT.md file with a production deployment checklist
3. THE System SHALL provide a CONTRIBUTING.md file with contribution guidelines
4. THE README.md SHALL NOT contain hardcoded URLs and SHALL reference environment variables instead
5. THE SECURITY.md SHALL include contact information for security reports and expected response times

### Requirement 6: Hardhat Configuration Enhancement

**User Story:** As a developer, I want proper network configuration, so that I can deploy contracts to Axiom Chain using environment variables.

#### Acceptance Criteria

1. THE hardhat.config.js SHALL include Axiom Chain network configuration using environment variables
2. THE hardhat.config.js SHALL load PRIVATE_KEY from environment variables for deployment
3. THE hardhat.config.js SHALL load AXIOM_RPC_URL from environment variables for network connection
4. IF environment variables are missing, THEN THE System SHALL provide clear error messages

### Requirement 7: Vite Configuration Optimization

**User Story:** As a developer, I want optimized build configuration, so that the production build is efficient and properly configured.

#### Acceptance Criteria

1. THE vite.config.js SHALL include build optimization settings for production
2. THE vite.config.js SHALL configure proper chunk splitting for vendor libraries
3. THE vite.config.js SHALL set appropriate source map configuration for production

### Requirement 8: Package.json Improvements

**User Story:** As a developer, I want proper package metadata and scripts, so that the project is well-documented and easy to work with.

#### Acceptance Criteria

1. THE root package.json SHALL have a proper description field describing the project
2. THE root package.json SHALL have an author field with appropriate attribution
3. THE root package.json SHALL include scripts for testing, linting, and deployment
4. THE root package.json SHALL include a script to run the GreenStepsToken deployment
5. THE frontend package.json SHALL include a script for production builds with proper flags

### Requirement 9: Deployment Script Creation

**User Story:** As a developer, I want a proper deployment script, so that I can deploy the GreenStepsToken contract to Axiom Chain.

#### Acceptance Criteria

1. THE System SHALL provide a deployment script for GreenStepsToken in the scripts directory
2. THE Deployment_Script SHALL verify the contract after deployment when ETHERSCAN_API_KEY is available
3. THE Deployment_Script SHALL output the deployed contract address
4. THE Deployment_Script SHALL handle deployment errors gracefully with informative messages

### Requirement 10: Code Quality and Cleanup

**User Story:** As a developer, I want clean, maintainable code, so that the project follows best practices and is easy to understand.

#### Acceptance Criteria

1. THE System SHALL remove unused dependencies from package.json files
2. THE System SHALL ensure all configurable values use environment variables
3. THE Frontend_Code SHALL use consistent import paths after restructuring
4. WHEN tests are run, THE System SHALL ensure all existing tests continue to pass
