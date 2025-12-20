import { detectRepo } from "../detectRepo";
import { suggestActions } from "../suggestActions";
import { formatSuggestions } from "../formatSuggestions";
import {
  canShowRepoPanel,
  markRepoPanelShown,
} from "../../session/sessionState";

export function maybeShowRepoPanel(cwd: string, render: (text: string) => void) {
  if (!canShowRepoPanel()) return;

  const repo = detectRepo(cwd);
  if (!repo) return;

  const suggestions = suggestActions(repo);
  const output = formatSuggestions(repo, suggestions);

  render(output);
  markRepoPanelShown();
}
