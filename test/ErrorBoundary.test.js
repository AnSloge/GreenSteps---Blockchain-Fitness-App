const { expect } = require("chai");
const fs = require("fs");
const path = require("path");

/**
 * Unit Tests: ErrorBoundary Component
 * 
 * **Validates: Requirements 3.2, 3.3**
 * 
 * Property 2: ErrorBoundary Fallback Display
 * For any React component wrapped in ErrorBoundary that throws an error during rendering,
 * the ErrorBoundary SHALL render a fallback UI instead of crashing the application.
 * 
 * Property 3: ErrorBoundary Error Logging
 * For any error caught by the ErrorBoundary component, the error details SHALL be logged
 * using console.error for debugging purposes.
 */
describe("ErrorBoundary Component Tests", function () {
  const errorBoundaryPath = path.join(__dirname, "..", "frontend", "src", "components", "ErrorBoundary.jsx");
  let content;

  before(function () {
    // Read the ErrorBoundary component file once
    if (!fs.existsSync(errorBoundaryPath)) {
      throw new Error(`ErrorBoundary component not found at: ${errorBoundaryPath}`);
    }
    content = fs.readFileSync(errorBoundaryPath, "utf-8");
  });

  /**
   * Property 2: ErrorBoundary Fallback Display
   * 
   * Test that when a child component throws an error,
   * the ErrorBoundary displays a fallback UI
   */
  describe("Property 2: ErrorBoundary Fallback Display", function () {
    it("should have getDerivedStateFromError method that sets hasError to true", function () {
      // Verify getDerivedStateFromError exists and returns correct state
      expect(content).to.include("getDerivedStateFromError");
      expect(content).to.match(/getDerivedStateFromError\s*\([^)]*\)\s*{[\s\S]*return\s*{[\s\S]*hasError:\s*true/);
    });

    it("should render fallback UI when hasError state is true", function () {
      // Verify the component has conditional rendering based on hasError
      expect(content).to.include("if (this.state.hasError)");
      
      // Verify fallback UI contains user-friendly error message
      expect(content).to.include("Oops! Something went wrong");
      expect(content).to.match(/Something went wrong|unexpected error|error occurred/i);
    });

    it("should display a Try Again button in fallback UI", function () {
      // Verify the component has a reset button
      expect(content).to.include("Try Again");
      expect(content).to.include("handleReset");
      
      // Verify the button is wired to handleReset
      expect(content).to.match(/onClick\s*=\s*{\s*this\.handleReset\s*}/);
    });

    it("should render children when no error occurs", function () {
      // Verify the component returns children when no error
      expect(content).to.include("return this.props.children");
    });

    it("should support custom fallback UI via props", function () {
      // Verify the component supports custom fallback
      expect(content).to.include("this.props.fallback");
      
      // Verify custom fallback is returned when provided
      expect(content).to.match(/if\s*\(\s*this\.props\.fallback\s*\)[\s\S]*return\s+this\.props\.fallback/);
    });

    it("should display error message in fallback UI", function () {
      // Verify error message is displayed
      expect(content).to.include("this.state.error");
      expect(content).to.match(/this\.state\.error.*toString\(\)/);
    });

    it("should use Material-UI components for fallback UI styling", function () {
      // Verify Material-UI components are imported and used
      expect(content).to.match(/import.*{.*Box.*}.*from.*@mui\/material/);
      expect(content).to.match(/import.*{.*Typography.*}.*from.*@mui\/material/);
      expect(content).to.match(/import.*{.*Button.*}.*from.*@mui\/material/);
      expect(content).to.match(/import.*{.*ErrorOutline.*}.*from.*@mui\/icons-material/);
    });
  });

  /**
   * Property 3: ErrorBoundary Error Logging
   * 
   * Test that when an error is caught,
   * the ErrorBoundary logs the error using console.error
   */
  describe("Property 3: ErrorBoundary Error Logging", function () {
    it("should have componentDidCatch method that logs errors", function () {
      // Verify componentDidCatch exists
      expect(content).to.include("componentDidCatch");
      
      // Verify it logs errors using console.error
      expect(content).to.match(/componentDidCatch[\s\S]*console\.error/);
    });

    it("should log error details with console.error in componentDidCatch", function () {
      // Verify console.error is called with error and errorInfo
      expect(content).to.match(/console\.error\s*\([^)]*error[^)]*errorInfo/);
    });

    it("should store error information in state for debugging", function () {
      // Verify errorInfo is stored in state
      expect(content).to.match(/componentDidCatch[\s\S]*setState[\s\S]*errorInfo/);
    });

    it("should log meaningful error message for debugging", function () {
      // Verify the console.error includes a descriptive message
      expect(content).to.match(/console\.error\s*\(\s*['"].*ErrorBoundary.*caught.*error/i);
    });
  });

  /**
   * Additional tests for error recovery functionality
   */
  describe("Error Recovery", function () {
    it("should have a reset handler that clears error state", function () {
      // Verify handleReset exists and resets state
      expect(content).to.include("handleReset");
      expect(content).to.match(/handleReset[\s\S]*setState[\s\S]*hasError:\s*false/);
    });

    it("should reset error, errorInfo, and hasError in handleReset", function () {
      // Verify all error state is cleared
      expect(content).to.match(/handleReset[\s\S]*hasError:\s*false/);
      expect(content).to.match(/handleReset[\s\S]*error:\s*null/);
      expect(content).to.match(/handleReset[\s\S]*errorInfo:\s*null/);
    });
  });

  /**
   * Component structure validation
   */
  describe("Component Structure", function () {
    it("should be a class component extending React.Component", function () {
      // Verify it's a class component
      expect(content).to.match(/class\s+ErrorBoundary\s+extends\s+Component/);
    });

    it("should initialize state with hasError, error, and errorInfo", function () {
      // Verify initial state
      expect(content).to.match(/this\.state\s*=\s*{[\s\S]*hasError:\s*false/);
      expect(content).to.match(/this\.state\s*=\s*{[\s\S]*error:\s*null/);
      expect(content).to.match(/this\.state\s*=\s*{[\s\S]*errorInfo:\s*null/);
    });

    it("should export the ErrorBoundary component as default", function () {
      // Verify default export
      expect(content).to.include("export default ErrorBoundary");
    });

    it("should have a constructor that initializes state", function () {
      // Verify constructor exists
      expect(content).to.match(/constructor\s*\(\s*props\s*\)/);
      expect(content).to.match(/super\s*\(\s*props\s*\)/);
    });
  });
});
