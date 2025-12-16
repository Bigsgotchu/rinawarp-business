import { RepoSuggestions, RepoProfile } from './profileTypes';

export function formatSuggestions(profile: RepoProfile, s: RepoSuggestions): string {
  const lines: string[] = [];

  // Top line with project type
  const projectType =
    profile.kind === 'node'
      ? 'Node.js'
      : profile.kind === 'python'
        ? 'Python'
        : profile.kind === 'go'
          ? 'Go'
          : profile.kind === 'rust'
            ? 'Rust'
            : profile.kind === 'docker'
              ? 'Docker'
              : 'project';

  lines.push(`Rina noticed this looks like a ${projectType} project.`);

  lines.push('');
  lines.push('Recommended next steps:');
  s.firstSteps.forEach((step) => {
    lines.push(`• ${step}`);
  });

  if (s.runCommands.length) {
    lines.push('');
    lines.push('Common commands:');
    s.runCommands.forEach((cmd) => {
      lines.push(`$ ${cmd}`);
    });
  }

  if (s.warnings.length) {
    lines.push('');
    lines.push('Notes:');
    s.warnings.forEach((warn) => {
      lines.push(`⚠ ${warn}`);
    });
  }

  return lines.join('\n');
}
