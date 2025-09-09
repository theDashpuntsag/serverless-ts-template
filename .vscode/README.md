# VS Code Configuration

This folder contains VS Code workspace configuration that ensures a consistent development experience across the team.

## 📁 Files Overview

### `extensions.json`

Defines recommended and unwanted extensions for the workspace:

**Essential Extensions:**

- **TypeScript Next** - Enhanced TypeScript support
- **Prettier** - Code formatting
- **ESLint** - Code linting and quality
- **GitHub Copilot** - AI-powered code assistance
- **AWS Toolkit** - AWS service integration
- **GitLens** - Enhanced Git capabilities

**Development Extensions:**

- **Material Icon Theme** - Better file icons
- **Todo Tree** - Track TODO comments
- **Path Intellisense** - Autocomplete file paths
- **Better Comments** - Colorized comments
- **Thunder Client** - API testing within VS Code

### `settings.json`

Workspace-wide settings that enforce:

**Code Quality:**

- Format on save with Prettier
- Auto-fix ESLint issues on save
- Organize imports automatically
- Consistent indentation (2 spaces)

**TypeScript Configuration:**

- Enhanced IntelliSense
- Auto-import suggestions
- Type hints and inlay hints
- Relative import preferences

**Visual Aids:**

- Editor rulers at 80 and 120 characters for consistent line length
- TypeScript inlay hints showing parameter names, types, and return types
- Bracket pair colorization and guides

**File Management:**

- Exclude `node_modules`, `dist`, `.git` from search
- Auto-save on focus change
- Trim trailing whitespace
- Insert final newline

### `launch.json`

Debug configurations for:

- **Launch Program** - Debug compiled JavaScript
- **Debug TypeScript** - Debug TypeScript directly with ts-node
- **Debug Jest Tests** - Debug unit tests
- **Debug Serverless Offline** - Debug local serverless functions
- **Attach to Process** - Attach to running processes

### `tasks.json`

Pre-configured tasks for common operations:

- **Build All** (Ctrl+Shift+P → "Tasks: Run Task")
- **Type Check All**
- **Lint All**
- **Format All**
- **Start Serverless Offline**
- **Deploy Stack**
- **Watch TypeScript**

### `typescript.code-snippets`

Useful code snippets for serverless TypeScript development:

| Snippet         | Trigger                | Description                                |
| --------------- | ---------------------- | ------------------------------------------ |
| `tsf`           | TypeScript Function    | Export const arrow function                |
| `tsi`           | TypeScript Interface   | Interface definition                       |
| `daf`           | Declare Async Function | Async function with Promise return type    |
| `lambda`        | AWS Lambda Handler     | Basic Lambda with createApiGatewayFunction |
| `lambdaget`     | Lambda GET by ID       | GET handler with path parameter validation |
| `lambdapost`    | Lambda POST Create     | POST handler with body validation          |
| `lambdaput`     | Lambda PUT Update      | PUT handler with ID and body validation    |
| `lambdaquery`   | Lambda Query           | Query handler with query params validation |
| `dynamo`        | DynamoDB Service       | Complete DynamoDB service with custom repo |
| `zod`           | Zod Schema             | Schema definition with TypeScript type     |
| `apiresponse`   | API Response           | Standard API Gateway response              |
| `errorresponse` | Error Response         | Error response with CORS headers           |
| `test`          | TypeScript Test        | Jest test template                         |

## 🚀 Getting Started

1. **Install Recommended Extensions:**
   - Open command palette (Ctrl+Shift+P)
   - Run "Extensions: Show Recommended Extensions"
   - Install all recommended extensions

2. **Verify Settings:**
   - Settings should automatically apply when opening the workspace
   - Check that Prettier formats on save
   - Verify ESLint is running (check status bar)

3. **Use Tasks:**
   - Press `Ctrl+Shift+P` and type "Tasks: Run Task"
   - Use "Build All" as default build task (Ctrl+Shift+B)

4. **Debug Setup:**
   - Press F5 to start debugging with default configuration
   - Configure environment variables in `.env` files as needed

## 🔧 Customization

### Personal Settings

If you need to override workspace settings for personal preferences:

1. Open User Settings (Ctrl+,)
2. Your personal settings will take precedence over workspace settings
3. Avoid changing workspace settings that affect code quality

### Adding Extensions

To recommend new extensions:

1. Install the extension
2. Add the extension ID to `extensions.json`
3. Commit the changes to share with the team

### Task Configuration

To add new tasks:

1. Edit `tasks.json`
2. Follow the existing pattern for consistency
3. Use appropriate problem matchers for error detection

## 🛡️ Enforced Standards

This configuration enforces:

- **Code Style:** Prettier formatting on save
- **Code Quality:** ESLint fixes on save
- **Type Safety:** TypeScript strict mode
- **Import Organization:** Automatic import sorting
- **File Consistency:** Trailing whitespace removal, final newlines
- **Git Integration:** Auto-fetch, smart commits

## � Editor Rulers & Line Length

The workspace is configured with **dual ruler lines** to help maintain consistent code formatting:

### **Ruler Configuration:**

```json
"editor.rulers": [80, 120]
```

### **What You See:**

- **First line at 80 characters** - Soft guideline for optimal readability
- **Second line at 120 characters** - Hard limit for maximum line length

### **Why These Lengths:**

- **80 characters:**
  - Traditional "safe" line length for readability
  - Better for code reviews and Git diffs
  - Works well on smaller screens and mobile devices
  - Encourages writing more concise, readable code
- **120 characters:**
  - Modern maximum line length
  - Matches Prettier's default configuration
  - Comfortable for modern wide monitors
  - Allows for longer variable names and imports

### **Customization Options:**

```json
// Remove all rulers
"editor.rulers": []

// Single ruler at 100 characters
"editor.rulers": [100]

// Just the modern limit
"editor.rulers": [120]

// Three-tier approach
"editor.rulers": [80, 100, 120]
```

## 👁️ TypeScript Inlay Hints

The workspace enables **comprehensive TypeScript inlay hints** to show type information inline with your code:

### **What You See in:**

#### **Parameter Names** (`"literals"`)

```typescript
myFunction('hello', 42, true);
//         ^name    ^count ^enabled (parameter names shown)
```

#### **Parameter Types** (`true`)

```typescript
function example(name, age, active) {
  //               ^: string ^: number ^: boolean (types shown)
}
```

#### **Variable Types** (`true`)

```typescript
const user = getUserData();
//    ^: User (inferred type shown)

const items = [1, 2, 3];
//    ^: number[] (array type shown)
```

#### **Property Declaration Types** (`true`)

```typescript
const config = {
  apiUrl: 'https://api.example.com', // ^: string
  timeout: 5000 // ^: number
};
```

#### **Function Return Types** (`true`)

```typescript
const processData = () => {
  return { success: true, data: [] };
}; // ^: { success: boolean; data: never[] }
```

### **Configuration:**

```json
"typescript.inlayHints.parameterNames.enabled": "literals",
"typescript.inlayHints.parameterTypes.enabled": true,
"typescript.inlayHints.variableTypes.enabled": true,
"typescript.inlayHints.propertyDeclarationTypes.enabled": true,
"typescript.inlayHints.functionLikeReturnTypes.enabled": true
```

### **Benefits:**

- **📚 Learning:** Understand TypeScript types without hovering
- **🐛 Debugging:** Quickly see what types you're working with
- **🔍 Code Review:** Easier to understand complex function signatures
- **⚡ Productivity:** No need to hover or check type definitions
- **🎯 Type Safety:** Spot type mismatches immediately

### **Customization Options:**

#### **Minimal Setup (parameter names only):**

```json
"typescript.inlayHints.parameterNames.enabled": "all",
"typescript.inlayHints.parameterTypes.enabled": false,
"typescript.inlayHints.variableTypes.enabled": false,
"typescript.inlayHints.propertyDeclarationTypes.enabled": false,
"typescript.inlayHints.functionLikeReturnTypes.enabled": false
```

#### **Types Only (no parameter names):**

```json
"typescript.inlayHints.parameterNames.enabled": "none",
"typescript.inlayHints.parameterTypes.enabled": true,
"typescript.inlayHints.variableTypes.enabled": true,
"typescript.inlayHints.propertyDeclarationTypes.enabled": true,
"typescript.inlayHints.functionLikeReturnTypes.enabled": true
```

#### **Disable All Inlay Hints:**

```json
"typescript.inlayHints.parameterNames.enabled": "none",
"typescript.inlayHints.parameterTypes.enabled": false,
"typescript.inlayHints.variableTypes.enabled": false,
"typescript.inlayHints.propertyDeclarationTypes.enabled": false,
"typescript.inlayHints.functionLikeReturnTypes.enabled": false
```

### **Quick Toggle:**

- **Command Palette:** `Cmd+Shift+P` → "TypeScript: Toggle Inlay Hints"
- **Manual Toggle:** Can be configured with custom keyboard shortcut

## �📝 Notes

- These settings apply only to this workspace
- Personal VS Code settings remain unchanged
- The configuration works best with the recommended extensions installed
- Some settings may require VS Code restart to take effect

## 🆘 Troubleshooting

**Prettier not formatting:**

- Ensure Prettier extension is installed
- Check that `.prettierrc` exists in project root
- Verify "Format on Save" is enabled

**ESLint not working:**

- Install ESLint extension
- Check for `eslint.config.mjs` in project
- Restart VS Code if needed

**TypeScript errors:**

- Ensure TypeScript extension is installed
- Check TypeScript version compatibility
- Run "TypeScript: Reload Projects" from command palette

**Rulers not showing:**

- Check that `"editor.rulers"` is set in settings.json
- Rulers appear as vertical lines at specified character positions
- Try restarting VS Code if rulers don't appear

**Inlay hints not appearing:**

- Ensure TypeScript extension is enabled and up-to-date
- Check that TypeScript inlay hint settings are enabled in settings.json
- Try "TypeScript: Restart TS Server" from command palette
- Verify you're working in a TypeScript file (.ts/.tsx)

**Inlay hints too cluttered:**

- Adjust individual inlay hint settings in settings.json
- Use "TypeScript: Toggle Inlay Hints" to quickly disable/enable
- Consider using "literals" mode for parameter names instead of "all"
