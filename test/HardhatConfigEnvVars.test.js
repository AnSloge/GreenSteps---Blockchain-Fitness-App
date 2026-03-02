const { expect } = require("chai");
const fc = require("fast-check");
const fs = require("fs");
const path = require("path");

/**
 * Property-Based Test: Configurable Values Use Environment Variables
 * 
 * **Validates: Requirements 10.2**
 * 
 * Property 5: Configurable Values Use Environment Variables
 * For any configuration value in hardhat.config.js that is deployment-specific 
 * (RPC URLs, private keys, API keys), the value SHALL be loaded from 
 * environment variables using process.env.
 */
describe("Property Test: Hardhat Config Environment Variables", function () {
  
  const configPath = path.join(__dirname, '..', 'hardhat.config.js');
  
  /**
   * Patterns that indicate sensitive or deployment-specific values
   * that should NOT be hardcoded
   */
  const sensitivePatterns = [
    // Private keys and secrets
    { pattern: /['"]0x[a-fA-F0-9]{64}['"]/, name: "Private Key" },
    { pattern: /['"]pk_[a-zA-Z0-9]+['"]/, name: "Private Key" },
    { pattern: /['"]sk_[a-zA-Z0-9]+['"]/, name: "Secret Key" },
    
    // API keys
    { pattern: /['"][A-Z0-9]{32,}['"]/, name: "API Key" },
    { pattern: /apiKey\s*:\s*['"][^'"]+['"]/, name: "API Key Assignment" },
    
    // RPC URLs with actual domains (not localhost or example)
    { pattern: /https?:\/\/(?!localhost|127\.0\.0\.1|example\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s'"]*/, name: "Hardcoded URL" },
    
    // Mnemonic phrases
    { pattern: /['"](?:\w+\s+){11,}\w+['"]/, name: "Mnemonic Phrase" }
  ];

  /**
   * Check if the config file contains hardcoded sensitive values
   */
  function findHardcodedSensitiveValues(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip comments
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
        return;
      }
      
      // Skip lines that are clearly using environment variables
      if (trimmedLine.includes('process.env')) {
        return;
      }
      
      // Check each sensitive pattern
      sensitivePatterns.forEach(({ pattern, name }) => {
        if (pattern.test(line)) {
          // Additional check: make sure it's not in a comment or string literal explanation
          const beforeMatch = line.substring(0, line.search(pattern));
          if (!beforeMatch.includes('//') && !beforeMatch.includes('/*')) {
            violations.push({
              line: index + 1,
              content: line.trim(),
              type: name
            });
          }
        }
      });
    });
    
    return violations;
  }

  /**
   * Verify that process.env is used for sensitive configuration values
   */
  function verifyEnvironmentVariableUsage(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for common sensitive configuration keys
    const requiredEnvVarUsages = [
      { key: 'PRIVATE_KEY', pattern: /process\.env\.PRIVATE_KEY/ },
      { key: 'RPC_URL', pattern: /process\.env\.\w*RPC_URL/ },
    ];
    
    const missingUsages = [];
    
    requiredEnvVarUsages.forEach(({ key, pattern }) => {
      if (!pattern.test(content)) {
        missingUsages.push(key);
      }
    });
    
    return missingUsages;
  }

  it("Property 5: No hardcoded sensitive values in hardhat.config.js", function () {
    // Verify the config file exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`Hardhat config file not found: ${configPath}`);
    }
    
    // Check for hardcoded sensitive values
    const violations = findHardcodedSensitiveValues(configPath);
    
    // Assert that no hardcoded sensitive values exist
    if (violations.length > 0) {
      const errorMessage = violations.map(v => 
        `  Line ${v.line} (${v.type}): ${v.content}`
      ).join('\n');
      
      expect.fail(
        `Found ${violations.length} hardcoded sensitive value(s) in hardhat.config.js:\n${errorMessage}\n\n` +
        `All deployment-specific values should use process.env instead.`
      );
    }
  });

  it("Property 5: Required environment variables are used via process.env", function () {
    // Verify the config file exists
    if (!fs.existsSync(configPath)) {
      throw new Error(`Hardhat config file not found: ${configPath}`);
    }
    
    // Check that required environment variables are referenced
    const missingUsages = verifyEnvironmentVariableUsage(configPath);
    
    // Assert that all required environment variables are used
    if (missingUsages.length > 0) {
      expect.fail(
        `Hardhat config should reference these environment variables: ${missingUsages.join(', ')}`
      );
    }
  });

  /**
   * Property-based test: Verify that any string matching sensitive patterns
   * would be correctly detected by our validation logic
   */
  it("Property 5: Sensitive value detection correctly identifies violations", function () {
    fc.assert(
      fc.property(
        fc.record({
          hasPrivateKey: fc.boolean(),
          hasRpcUrl: fc.boolean(),
          usesEnvVar: fc.boolean()
        }),
        (testCase) => {
          // Generate test content based on the test case
          let content = 'module.exports = {\n';
          content += '  networks: {\n';
          content += '    testnet: {\n';
          
          if (testCase.hasRpcUrl) {
            if (testCase.usesEnvVar) {
              content += '      url: process.env.RPC_URL || "",\n';
            } else {
              content += '      url: "https://rpc.example-network.com",\n';
            }
          }
          
          if (testCase.hasPrivateKey) {
            if (testCase.usesEnvVar) {
              content += '      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],\n';
            } else {
              content += '      accounts: ["0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"],\n';
            }
          }
          
          content += '    }\n';
          content += '  }\n';
          content += '};\n';
          
          // Create a temporary file
          const tempFile = path.join(__dirname, 'temp-hardhat-config.js');
          fs.writeFileSync(tempFile, content);
          
          try {
            const violations = findHardcodedSensitiveValues(tempFile);
            
            // Property: Hardcoded values should be detected when not using env vars
            const shouldHaveViolations = (testCase.hasPrivateKey || testCase.hasRpcUrl) && !testCase.usesEnvVar;
            
            if (shouldHaveViolations) {
              expect(violations.length).to.be.greaterThan(0, 
                'Should detect hardcoded sensitive values when not using process.env');
            } else if (testCase.usesEnvVar) {
              expect(violations.length).to.equal(0, 
                'Should not detect violations when using process.env');
            }
          } finally {
            // Clean up temp file
            if (fs.existsSync(tempFile)) {
              fs.unlinkSync(tempFile);
            }
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations
    );
  });
});
