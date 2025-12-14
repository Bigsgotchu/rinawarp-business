import { RepoProfile, RepoSuggestions } from "./profileTypes";

export function suggestActions(profile: RepoProfile): RepoSuggestions {
  switch (profile.kind) {
    case "node":
      return nodeSuggestions(profile);
    case "python":
      return pythonSuggestions(profile);
    default:
      return {
        firstSteps: [
          "Explore the repository structure",
          "Check the README for setup instructions",
        ],
        runCommands: [],
        warnings: [],
        confidence: 0.3,
      };
  }
}

function nodeSuggestions(profile: RepoProfile): RepoSuggestions {
  const pm = profile.packageManager ?? "npm";

  return {
    firstSteps: [
      "Install dependencies",
      "Look for available scripts",
      "Start the development server if available",
    ],
    runCommands: [
      `${pm} install`,
      `${pm} run dev`,
    ],
    warnings: [
      "If install fails, check Node.js version compatibility",
    ],
    confidence: 0.9,
  };
}

function pythonSuggestions(profile: RepoProfile): RepoSuggestions {
  return {
    firstSteps: [
      "Create a virtual environment",
      "Install dependencies",
      "Run the main entry point",
    ],
    runCommands: [
      "python -m venv .venv",
      "source .venv/bin/activate",
      "pip install -r requirements.txt",
    ],
    warnings: [
      "Ensure Python 3.9+ is installed",
    ],
    confidence: 0.85,
  };
}
