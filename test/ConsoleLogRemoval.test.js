const { expect } = require("chai");
const fc = require("fast-check");
const fs = require("fs");
const path = require("path");

/**
 * Property-Based Test: Debug Console Log Removal
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * Property 1: Debug Console Log Removal
 * For any JavaScript/JSX file in the frontend source directory, 
 * the file SHALL NOT contain console.log statements 
 * (excluding console.error for error handling).
 */
describe("Property Test: Console Log Removal", function () {
  
  /**
   * Recursively get all JavaScript/JSX files in a directory
   */
  function getJavaScriptFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
          getJavaScriptFiles(filePath, fileList);
        }
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  /**
   * Check if a file contains console.log statements
   * Returns an array of line numbers where console.log is found
   */
  function findConsoleLogStatements(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations = [];
    
    lines.forEach((line, index) => {
      // Match console.log but not console.error, console.warn, console.info
      // Also exclude commented lines
      const trimmedLine = line.trim();
      
      // Skip if line is a comment
      if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
        return;
      }
      
      // Check for console.log (but not console.error, console.warn, etc.)
      if (/console\.log\s*\(/.test(line)) {
        violations.push({
          line: index + 1,
          content: line.trim()
        });
      }
    });
    
    return violations;
  }

  it("Property 1: No console.log statements in frontend source files", function () {
    const frontendSrcDir = path.join(__dirname, '..', 'frontend', 'src');
    
    // Verify the directory exists
    if (!fs.existsSync(frontendSrcDir)) {
      throw new Error(`Frontend source directory not found: ${frontendSrcDir}`);
    }
    
    // Get all JavaScript/JSX files
    const jsFiles = getJavaScriptFiles(frontendSrcDir);
    
    // Ensure we found some files
    expect(jsFiles.length).to.be.greaterThan(0, 
      "Should find at least one JavaScript/JSX file in frontend/src");
    
    // Property: For each file, verify no console.log statements exist
    const filesWithViolations = [];
    
    jsFiles.forEach(filePath => {
      const violations = findConsoleLogStatements(filePath);
      
      if (violations.length > 0) {
        filesWithViolations.push({
          file: path.relative(path.join(__dirname, '..'), filePath),
          violations: violations
        });
      }
    });
    
    // Assert that no files contain console.log statements
    if (filesWithViolations.length > 0) {
      const errorMessage = filesWithViolations.map(item => {
        const violationDetails = item.violations.map(v => 
          `  Line ${v.line}: ${v.content}`
        ).join('\n');
        return `\n${item.file}:\n${violationDetails}`;
      }).join('\n');
      
      expect.fail(
        `Found console.log statements in ${filesWithViolations.length} file(s):${errorMessage}\n\n` +
        `These should be removed or replaced with console.error for error handling.`
      );
    }
  });

  /**
   * Property-based test using fast-check to verify the detection logic
   * This tests that our console.log detection correctly identifies violations
   */
  it("Property 2: Console.log detection correctly identifies violations", function () {
    fc.assert(
      fc.property(
        fc.record({
          hasConsoleLog: fc.boolean(),
          hasConsoleError: fc.boolean(),
          hasComment: fc.boolean()
        }),
        (testCase) => {
          // Generate test content based on the test case
          let content = '';
          
          if (testCase.hasComment) {
            content += '// This is a comment with console.log()\n';
          }
          
          if (testCase.hasConsoleError) {
            content += 'console.error("This is an error");\n';
          }
          
          if (testCase.hasConsoleLog) {
            content += 'console.log("Debug message");\n';
          }
          
          // Create a temporary file
          const tempFile = path.join(__dirname, 'temp-test-file.js');
          fs.writeFileSync(tempFile, content);
          
          try {
            const violations = findConsoleLogStatements(tempFile);
            
            // Property: console.log should be detected, but not console.error or comments
            if (testCase.hasConsoleLog) {
              expect(violations.length).to.be.greaterThan(0, 
                'Should detect console.log statement');
            } else {
              expect(violations.length).to.equal(0, 
                'Should not detect violations when only console.error or comments present');
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
