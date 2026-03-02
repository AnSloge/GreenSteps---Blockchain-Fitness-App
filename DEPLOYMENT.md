# Deployment Guide

This guide provides step-by-step instructions for deploying the GreenSteps blockchain fitness application to production.

## Prerequisites

Before deploying, ensure you have:

- [ ] Node.js (v18 or higher) installed
- [ ] pnpm package manager installed
- [ ] Access to Axiom Chain RPC endpoint
- [ ] Wallet with sufficient funds for deployment gas fees
- [ ] All required environment variables configured

## Environment Setup

### 1. Root Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Required for smart contract deployment
PRIVATE_KEY=your_deployment_wallet_private_key
AXIOM_RPC_URL=https://rpc.axiom.network/
ETHERSCAN_API_KEY=optional_for_contract_verification
```

**Security Note**: Never commit the `.env` file to version control. Use `.env.example` as a template.

### 2. Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
# Required for frontend to interact with deployed contract
VITE_CONTRACT_ADDRESS=deployed_contract_address_here
VITE_AXIOM_RPC_URL=https://rpc.axiom.network/
VITE_CHAIN_ID=23413
```

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests pass: `pnpm test`
- [ ] No console.log statements in production code
- [ ] Code has been reviewed and approved
- [ ] Dependencies are up to date and audited
- [ ] No security vulnerabilities in dependencies: `pnpm audit`

### Smart Contract

- [ ] Contract code has been reviewed
- [ ] Unit tests pass with 100% coverage
- [ ] Gas optimization has been considered
- [ ] Contract has been tested on testnet
- [ ] Initial supply and parameters are correct

### Frontend

- [ ] Production build succeeds: `cd frontend && pnpm build`
- [ ] Environment variables are properly configured
- [ ] Error boundaries are in place
- [ ] Build output is optimized (check bundle size)
- [ ] All API endpoints use environment variables

### Documentation

- [ ] README.md is up to date
- [ ] SECURITY.md is reviewed
- [ ] API documentation is current
- [ ] Deployment notes are documented

## Deployment Steps

### Step 1: Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..
```

### Step 2: Compile Smart Contracts

```bash
# Compile contracts
pnpm hardhat compile

# Verify compilation succeeded
# Check artifacts/contracts/ for compiled output
```

### Step 3: Run Tests

```bash
# Run smart contract tests
pnpm test

# Ensure all tests pass before proceeding
```

### Step 4: Deploy to Axiom Chain Testnet (Optional but Recommended)

```bash
# Deploy to testnet first for validation
pnpm hardhat run scripts/deploy-greensteps.js --network axiom_testnet

# Test the deployed contract on testnet
# Verify all functions work as expected
```

### Step 5: Deploy to Axiom Chain Mainnet

```bash
# Deploy to production
pnpm deploy:axiom

# Or manually:
pnpm hardhat run scripts/deploy-greensteps.js --network axiom

# Save the deployed contract address
```

**Important**: The deployment script will output the contract address. Save this address immediately.

### Step 6: Verify Contract (Optional)

If you have an Etherscan API key configured:

```bash
pnpm hardhat verify --network axiom <CONTRACT_ADDRESS>
```

### Step 7: Update Frontend Environment

Update `frontend/.env` with the deployed contract address:

```bash
VITE_CONTRACT_ADDRESS=<deployed_contract_address>
```

### Step 8: Build Frontend

```bash
cd frontend
pnpm build

# Verify build output in frontend/dist/
```

### Step 9: Deploy Frontend

Deploy the `frontend/dist/` directory to your hosting provider:

**Vercel:**

```bash
cd frontend
vercel --prod
```

**Netlify:**

```bash
cd frontend
netlify deploy --prod --dir=dist
```

**Other Providers:**

- Upload the contents of `frontend/dist/` to your web server
- Ensure environment variables are configured in your hosting platform

### Step 10: Post-Deployment Verification

- [ ] Visit the deployed frontend URL
- [ ] Connect wallet and verify blockchain connection
- [ ] Test core functionality:
  - [ ] Submit steps
  - [ ] Claim rewards
  - [ ] View stats
  - [ ] Check token balance
- [ ] Monitor for errors in browser console
- [ ] Check smart contract on block explorer

## Rollback Procedure

If issues are discovered after deployment:

### Smart Contract Rollback

**Note**: Smart contracts cannot be modified after deployment. Options:

1. **Deploy a new version** with fixes
2. **Update frontend** to point to previous contract (if applicable)
3. **Communicate with users** about the issue and resolution

### Frontend Rollback

Most hosting providers support instant rollback:

**Vercel:**

```bash
# Rollback to previous deployment via dashboard or CLI
vercel rollback
```

**Netlify:**

```bash
# Restore previous deployment via dashboard
```

## Monitoring and Maintenance

### Post-Deployment Monitoring

- [ ] Set up error tracking (e.g., Sentry)
- [ ] Monitor contract events on block explorer
- [ ] Track gas usage and transaction costs
- [ ] Monitor frontend performance metrics
- [ ] Set up uptime monitoring

### Regular Maintenance

- [ ] Review security advisories weekly
- [ ] Update dependencies monthly
- [ ] Monitor blockchain network status
- [ ] Backup deployment configurations
- [ ] Review and rotate API keys quarterly

## Troubleshooting

### Common Deployment Issues

**Issue**: Contract deployment fails with "insufficient funds"

- **Solution**: Ensure deployment wallet has enough native tokens for gas

**Issue**: Frontend cannot connect to contract

- **Solution**: Verify `VITE_CONTRACT_ADDRESS` is correct and contract is deployed

**Issue**: Build fails with module errors

- **Solution**: Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`

**Issue**: Contract verification fails

- **Solution**: Ensure compiler version matches and constructor arguments are correct

### Getting Help

- Check GitHub Issues for similar problems
- Review Hardhat documentation: https://hardhat.org/
- Review Vite documentation: https://vitejs.dev/
- Contact the team via security@greensteps.example.com for urgent issues

## Security Considerations

### Production Security Checklist

- [ ] Private keys are stored securely (never in code)
- [ ] Environment variables are configured in hosting platform
- [ ] HTTPS is enabled for frontend
- [ ] Rate limiting is configured (if applicable)
- [ ] CORS is properly configured
- [ ] Security headers are set
- [ ] Dependencies have no known vulnerabilities

### Access Control

- [ ] Deployment wallet private key is secured
- [ ] Only authorized personnel have deployment access
- [ ] API keys are rotated regularly
- [ ] Hosting platform access is restricted

## Deployment Checklist Summary

Use this quick checklist for each deployment:

- [ ] Environment variables configured
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Dependencies audited
- [ ] Contracts compiled
- [ ] Deployed to testnet and verified
- [ ] Deployed to mainnet
- [ ] Contract address saved
- [ ] Frontend environment updated
- [ ] Frontend built and deployed
- [ ] Post-deployment verification complete
- [ ] Monitoring configured
- [ ] Team notified of deployment

## Version History

| Version | Date | Deployed By | Contract Address | Notes              |
| ------- | ---- | ----------- | ---------------- | ------------------ |
| 1.0.0   | TBD  | TBD         | TBD              | Initial deployment |

---

**Last Updated**: 2024
**Maintained By**: GreenSteps Development Team
