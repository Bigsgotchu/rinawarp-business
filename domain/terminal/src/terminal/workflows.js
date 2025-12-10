/**
 * RinaWarp Terminal Pro - Workflows System
 * Implements Warp-style workflows for common tasks
 */

class Workflows {
  constructor(terminal) {
    this.terminal = terminal;
    this.workflows = new Map();
    this.activeWorkflow = null;
    this.workflowHistory = [];

    this.initializeDefaultWorkflows();
  }

  initializeDefaultWorkflows() {
    // Git workflow
    this.addWorkflow('git-setup', {
      name: 'Git Repository Setup',
      description: 'Initialize a new git repository with common setup',
      commands: [
        'git init',
        'git add .',
        'git commit -m "Initial commit"',
        'git branch -M main',
        'git remote add origin <repository-url>',
        'git push -u origin main',
      ],
      variables: ['repository-url'],
    });

    // Node.js project setup
    this.addWorkflow('node-setup', {
      name: 'Node.js Project Setup',
      description: 'Create a new Node.js project with common dependencies',
      commands: [
        'npm init -y',
        'npm install express cors dotenv',
        'npm install -D nodemon',
        'mkdir src public',
        'echo "console.log(\'Hello World\');" > src/index.js',
        'echo "node src/index.js" > start.sh',
      ],
    });

    // React project setup
    this.addWorkflow('react-setup', {
      name: 'React Project Setup',
      description: 'Create a new React project with Vite',
      commands: [
        'npm create vite@latest . -- --template react',
        'npm install',
        'npm install @types/react @types/react-dom',
        'npm run dev',
      ],
    });

    // Docker setup
    this.addWorkflow('docker-setup', {
      name: 'Docker Project Setup',
      description: 'Create Docker configuration for a project',
      commands: [
        'echo "FROM node:18-alpine" > Dockerfile',
        'echo "WORKDIR /app" >> Dockerfile',
        'echo "COPY package*.json ./" >> Dockerfile',
        'echo "RUN npm install" >> Dockerfile',
        'echo "COPY . ." >> Dockerfile',
        'echo "EXPOSE 3000" >> Dockerfile',
        'echo "CMD [\"npm\", \"start\"]" >> Dockerfile',
        'echo "version: \'3.8\'" > docker-compose.yml',
        'echo "services:" >> docker-compose.yml',
        'echo "  app:" >> docker-compose.yml',
        'echo "    build: ." >> docker-compose.yml',
        'echo "    ports:" >> docker-compose.yml',
        'echo "      - \"3000:3000\"" >> docker-compose.yml',
      ],
    });

    // Database setup
    this.addWorkflow('db-setup', {
      name: 'Database Setup',
      description: 'Set up a database with common configuration',
      commands: [
        'mkdir database',
        'echo "CREATE DATABASE myapp;" > database/init.sql',
        'echo "USE myapp;" >> database/init.sql',
        'echo "CREATE TABLE users (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(100), email VARCHAR(100));" >> database/init.sql',
        'echo "INSERT INTO users (name, email) VALUES (\'John Doe\', \'john@example.com\');" >> database/init.sql',
      ],
    });
  }

  addWorkflow(id, workflow) {
    this.workflows.set(id, {
      id,
      ...workflow,
      createdAt: Date.now(),
    });
  }

  getWorkflows() {
    return Array.from(this.workflows.values());
  }

  getWorkflow(id) {
    return this.workflows.get(id);
  }

  async runWorkflow(id, variables = {}) {
    const workflow = this.getWorkflow(id);
    if (!workflow) {
      throw new Error(`Workflow ${id} not found`);
    }

    this.activeWorkflow = {
      id,
      startTime: Date.now(),
      currentStep: 0,
      variables,
      status: 'running',
    };

    this.workflowHistory.push({
      ...this.activeWorkflow,
      endTime: null,
      status: 'running',
    });

    try {
      for (let i = 0; i < workflow.commands.length; i++) {
        this.activeWorkflow.currentStep = i;
        const command = this.replaceVariables(workflow.commands[i], variables);

        // Create command block
        const block = this.terminal.commandBlocks.createBlock(command);

        // Simulate command execution
        await this.executeWorkflowCommand(command, block.id);

        // Wait a bit between commands
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      this.activeWorkflow.status = 'completed';
      this.workflowHistory[this.workflowHistory.length - 1].status =
        'completed';
      this.workflowHistory[this.workflowHistory.length - 1].endTime =
        Date.now();
    } catch (error) {
      this.activeWorkflow.status = 'error';
      this.workflowHistory[this.workflowHistory.length - 1].status = 'error';
      this.workflowHistory[this.workflowHistory.length - 1].endTime =
        Date.now();
      throw error;
    } finally {
      this.activeWorkflow = null;
    }
  }

  replaceVariables(command, variables) {
    let result = command;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`<${key}>`, 'g'), value);
    });
    return result;
  }

  async executeWorkflowCommand(command, blockId) {
    // Simulate command execution
    const output = await this.simulateCommand(command);

    // Add output to block
    this.terminal.commandBlocks.addOutput(blockId, output);
    this.terminal.commandBlocks.finishBlock(blockId, 0);
  }

  async simulateCommand(command) {
    // Simulate different command outputs
    if (command.startsWith('git init')) {
      return 'Initialized empty Git repository in .git/';
    } else if (command.startsWith('npm init')) {
      return 'Wrote to package.json';
    } else if (command.startsWith('npm install')) {
      return 'added 100 packages, and audited 100 packages in 2s';
    } else if (command.startsWith('mkdir')) {
      return 'Directory created';
    } else if (command.startsWith('echo')) {
      return 'Command executed';
    } else if (command.startsWith('docker')) {
      return 'Docker command executed';
    } else {
      return `Executed: ${command}`;
    }
  }

  createCustomWorkflow(name, description, commands, variables = []) {
    const id = `custom-${Date.now()}`;
    this.addWorkflow(id, {
      name,
      description,
      commands,
      variables,
    });
    return id;
  }

  getWorkflowHistory() {
    return this.workflowHistory;
  }

  getActiveWorkflow() {
    return this.activeWorkflow;
  }

  stopWorkflow() {
    if (this.activeWorkflow) {
      this.activeWorkflow.status = 'stopped';
      this.activeWorkflow = null;
    }
  }

  // AI-powered workflow generation
  async generateWorkflow(description) {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate a workflow for: ${description}. Return a JSON object with name, description, and commands array.`,
          provider: 'groq',
        }),
      });

      const data = await response.json();
      const workflowData = JSON.parse(data.response);

      const id = this.createCustomWorkflow(
        workflowData.name,
        workflowData.description,
        workflowData.commands,
        workflowData.variables || []
      );

      return id;
    } catch (error) {
      console.error('Error generating workflow:', error);
      throw error;
    }
  }
}

export default Workflows;
