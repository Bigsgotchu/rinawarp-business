export type ToolContext = {
  convoId: string;
  cwd?: string;
  userId?: string;
  permissions: {
    shell: boolean;
    fs: boolean;
    network: boolean;
    process: boolean;
    git: boolean;
  };
};

export type ToolSpec<TArgs = any> = {
  name: string;
  description: string;
  schema: any;
  requires: (keyof ToolContext["permissions"])[];
  run: (args: TArgs, ctx: ToolContext) => Promise<any> | any;
};

const tools = new Map<string, ToolSpec>();

export function registerTool(spec: ToolSpec) {
  tools.set(spec.name, spec);
}

export function listTools() {
  return Array.from(tools.values()).map(t => ({
    name: t.name,
    description: t.description,
    schema: t.schema,
    requires: t.requires
  }));
}

export async function runTool(name: string, args: any, ctx: ToolContext) {
  const tool = tools.get(name);
  if (!tool) throw new Error(`Tool not found: ${name}`);

  for (const perm of tool.requires) {
    if (!ctx.permissions[perm]) throw new Error(`Permission denied for tool: ${name}`);
  }
  return tool.run(args, ctx);
}
