// IPC communication utilities

export interface CommandResult {
  output: string;
  status: string;
}

export interface CommandLog {
  timestamp: Date;
  command: string;
  result: CommandResult;
}
