# Security Policy

## Reporting a Vulnerability

The GreenSteps team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@greensteps.example.com**

You should receive a response within **48 hours**. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include in Your Report

To help us better understand the nature and scope of the potential issue, please include as much of the following information as possible:

- Type of vulnerability (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours of report submission
- **Status Update**: Within 5 business days with an assessment of the report
- **Resolution Timeline**: Varies based on severity and complexity
  - **Critical**: 7-14 days
  - **High**: 14-30 days
  - **Medium**: 30-60 days
  - **Low**: 60-90 days

### What to Expect

After you submit a report, the team will:

1. Confirm receipt of your vulnerability report
2. Assess the vulnerability and determine its severity
3. Work on a fix and coordinate disclosure timing with you
4. Publicly acknowledge your responsible disclosure (if you wish)

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices for Contributors

When contributing to GreenSteps, please follow these security guidelines:

### Environment Variables

- **Never commit** `.env` files or files containing sensitive credentials
- Use `.env.example` files with placeholder values only
- Store private keys, API keys, and RPC URLs in environment variables
- Review `.gitignore` to ensure sensitive files are excluded

### Smart Contract Security

- Follow established Solidity security patterns
- Be aware of common vulnerabilities (reentrancy, integer overflow, etc.)
- Test thoroughly before deployment
- Use established libraries (OpenZeppelin) when possible

### Frontend Security

- Validate all user inputs
- Sanitize data before rendering
- Use secure communication (HTTPS) for all API calls
- Never expose private keys or sensitive data in client-side code

### Dependency Management

- Keep dependencies up to date
- Review security advisories for used packages
- Use `npm audit` or `pnpm audit` regularly
- Pin dependency versions in production

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find any similar problems
3. Prepare fixes for all supported versions
4. Release patches as soon as possible

We ask that you:

- Give us reasonable time to fix the issue before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- Do not access or modify data that doesn't belong to you
- Contact us before engaging in any security research that could affect our users

## Recognition

We believe in recognizing security researchers who help us keep GreenSteps secure. With your permission, we will:

- Publicly acknowledge your responsible disclosure
- Credit you in our release notes
- Add your name to our security hall of fame (if we create one)

Thank you for helping keep GreenSteps and our users safe!

## Contact

For security-related questions or concerns, contact:

- **Email**: security@greensteps.example.com
- **PGP Key**: Available upon request

For general questions and support, please use our regular support channels or open a GitHub issue.
