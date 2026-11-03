# Agent Codebase Overview

## 📁 Project Structure
```
harness-master/
├── .git/
├── models/
├── node_modules/
├── src/
│   ├── api/
│   ├── chat/
│   ├── dashboard/
│   ├── modules/
│   │   ├── CreateServer.ts
│   │   ├── ModelLoader.ts
│   │   └── HandleCommand.ts
│   ├── workflows/
│   │   └── default/
│   │       └── main.ts
│   └── index.ts
├── workspace/
├── .env
├── .gitignore
├── package-lock.json
├── package.json
└── tsconfig.json
```

## 🧠 Key Components

### 1. Core Modules
- **CreateServer.ts**: Sets up an Express server with static file serving and API routing
- **ModelLoader.ts**: Manages model loading from local storage or downloads from Hugging Face
- **HandleCommand.ts**: Processes stack commands for model loading/unloading

### 2. Workflows
- **main.ts**: Entry point for agent operations (currently empty but ready for implementation)

## 🛠️ Agent Implementation Guidelines

1. **No new files** - All agent logic must be implemented in existing files
2. **Minimal code** - Use concise, single-purpose functions
3. **No comments** - Rely on clear variable names and structure
4. **Continuous operation** - Implement infinite loops in workflows/default/main.ts
5. **Modification only** - Never create new files, only enhance existing ones

## 🚀 Current Tasks

1. Implement agent logic in `src/workflows/default/main.ts`
2. Integrate with existing modules for model handling and command processing
3. Ensure continuous operation without file creation

## 📌 Notes

- All code must follow the existing TypeScript configuration in tsconfig.json
- Use the package.json scripts for development and testing
- The .env file contains critical configuration variables

This structure provides a foundation for agent-based continuous operation while adhering to the no-new-files constraint.