const { expect } = require("chai");
const fc = require("fast-check");
const fs = require("fs");
const path = require("path");

/**
 * Property-Based Test: README Hardcoded URL Removal
 * 
 * **Validates: Requirements 5.4**
 * 
 * Property 4: README Hardcoded URL Removal
 * For any URL pattern in README.md that references deployment-specific endpoints 
 * (excluding documentation links and static assets), the URL SHALL be replaced 
 * with environment variable references or placeholder text.
 */
describe("Property Test: README Hardcoded URL Removal", function () {
  
  /**
   * Patterns for deployment-specific URLs that should NOT be hardcoded
   * These are URLs that change per deployment and should use placeholders
   */
  const DEPLOYMENT_URL_PATTERNS = [
    // Vercel deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.vercel\.app/i,
    // Netlify deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.netlify\.app/i,
    // Heroku deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.herokuapp\.com/i,
    // AWS deployment URLs (CloudFront, S3, etc.)
    /https?:\/\/[a-zA-Z0-9-]+\.cloudfront\.net/i,
    /https?:\/\/[a-zA-Z0-9-]+\.s3\.amazonaws\.com/i,
    /https?:\/\/[a-zA-Z0-9-]+\.s3-website[.-][a-z0-9-]+\.amazonaws\.com/i,
    // Azure deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.azurewebsites\.net/i,
    // Google Cloud deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.appspot\.com/i,
    /https?:\/\/[a-zA-Z0-9-]+\.web\.app/i,
    // Railway deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.railway\.app/i,
    // Render deployment URLs
    /https?:\/\/[a-zA-Z0-9-]+\.onrender\.com/i,
    // DigitalOcean App Platform URLs
    /https?:\/\/[a-zA-Z0-9-]+\.ondigitalocean\.app/i,
  ];

  /**
   * Patterns for allowed URLs that are documentation or static resources
   * These are acceptable to hardcode as they don't change per deployment
   */
  const ALLOWED_URL_PATTERNS = [
    // GitHub repository URLs
    /https?:\/\/github\.com\//i,
    // Documentation sites
    /https?:\/\/docs\./i,
    // Official blockchain explorers and RPC endpoints
    /https?:\/\/rpc\.axiom\.network/i,
    /https?:\/\/explorer\.axiom\.network/i,
    // NPM and package registries
    /https?:\/\/www\.npmjs\.com/i,
    // Official documentation sites
    /https?:\/\/(reactjs\.org|react\.dev|ethereum\.org|soliditylang\.org)/i,
    // Localhost URLs (for development instructions)
    /https?:\/\/localhost/i,
    /https?:\/\/127\.0\.0\.1/i,
  ];

  /**
   * Check if a URL is a deployment-specific URL that should not be hardcoded
   */
  function isDeploymentUrl(url) {
    // Check if it matches any deployment pattern
    const matchesDeploymentPattern = DEPLOYMENT_URL_PATTERNS.some(pattern => 
      pattern.test(url)
    );
    
    // Check if it's an allowed URL
    const isAllowedUrl = ALLOWED_URL_PATTERNS.some(pattern => 
      pattern.test(url)
    );
    
    return matchesDeploymentPattern && !isAllowedUrl;
  }

  /**
   * Find all hardcoded deployment URLs in README.md
   * Returns an array of violations with line numbers and URLs
   */
  function findHardcodedDeploymentUrls(readmePath) {
    const content = fs.readFileSync(readmePath, 'utf-8');
    const lines = content.split('\n');
    const violations = [];
    
    // Regex to match URLs in markdown
    const urlRegex = /https?:\/\/[^\s\)]+/gi;
    
    lines.forEach((line, index) => {
      const matches = line.match(urlRegex);
      
      if (matches) {
        matches.forEach(url => {
          // Clean up trailing punctuation that might be captured
          const cleanUrl = url.replace(/[.,;:!?]+$/, '');
          
          if (isDeploymentUrl(cleanUrl)) {
            violations.push({
              line: index + 1,
              url: cleanUrl,
              content: line.trim()
            });
          }
        });
      }
    });
    
    return violations;
  }

  it("Property 4: README contains no hardcoded deployment URLs", function () {
    const readmePath = path.join(__dirname, '..', 'README.md');
    
    // Verify README.md exists
    if (!fs.existsSync(readmePath)) {
      throw new Error(`README.md not found at: ${readmePath}`);
    }
    
    // Find all hardcoded deployment URLs
    const violations = findHardcodedDeploymentUrls(readmePath);
    
    // Assert that no deployment URLs are hardcoded
    if (violations.length > 0) {
      const errorMessage = violations.map(v => 
        `  Line ${v.line}: ${v.url}\n    Context: ${v.content}`
      ).join('\n\n');
      
      expect.fail(
        `Found ${violations.length} hardcoded deployment URL(s) in README.md:\n\n${errorMessage}\n\n` +
        `These should be replaced with placeholders like "[Your deployment URL here]" or ` +
        `environment variable references.`
      );
    }
  });

  /**
   * Property-based test to verify URL detection logic
   * Tests that deployment URLs are correctly identified
   */
  it("Property 5: Deployment URL detection correctly identifies violations", function () {
    // Test deployment URLs
    const deploymentUrls = [
      "https://my-app.vercel.app",
      "https://my-app.netlify.app",
      "https://my-app.herokuapp.com",
      "https://d111111abcdef8.cloudfront.net",
      "https://my-app.onrender.com"
    ];
    
    deploymentUrls.forEach(url => {
      const isDeployment = isDeploymentUrl(url);
      expect(isDeployment).to.be.true, `${url} should be detected as deployment URL`;
    });
    
    // Test allowed URLs
    const allowedUrls = [
      "https://github.com/user/repo",
      "https://rpc.axiom.network/",
      "https://explorer.axiom.network/",
      "https://localhost:5173",
      "https://docs.example.com"
    ];
    
    allowedUrls.forEach(url => {
      const isDeployment = isDeploymentUrl(url);
      expect(isDeployment).to.be.false, `${url} should NOT be detected as deployment URL`;
    });
  });

  /**
   * Property-based test to verify placeholder detection
   * Tests that placeholder text is correctly recognized as non-violations
   */
  it("Property 6: Placeholder text is not flagged as violation", function () {
    // Test with placeholder only
    let content = '# Test README\n\nTry the app at: `[Your deployment URL here]`\n';
    let tempReadme = path.join(__dirname, 'temp-readme-placeholder.md');
    fs.writeFileSync(tempReadme, content);
    
    try {
      let violations = findHardcodedDeploymentUrls(tempReadme);
      expect(violations.length).to.equal(0, 'Placeholder text should not be flagged');
    } finally {
      if (fs.existsSync(tempReadme)) {
        fs.unlinkSync(tempReadme);
      }
    }
    
    // Test with actual deployment URL
    content = '# Test README\n\nVisit: https://my-app.vercel.app\n';
    tempReadme = path.join(__dirname, 'temp-readme-url.md');
    fs.writeFileSync(tempReadme, content);
    
    try {
      let violations = findHardcodedDeploymentUrls(tempReadme);
      expect(violations.length).to.equal(1, 'Deployment URL should be flagged');
    } finally {
      if (fs.existsSync(tempReadme)) {
        fs.unlinkSync(tempReadme);
      }
    }
  });
});
