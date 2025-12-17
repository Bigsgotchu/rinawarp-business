export const wording = {
  reflectIntent: (intent: string) =>
    `Okay—sounds like you want to ${intent.trim().replace(/\.$/, '')}.`,

  // Tone variants (meaning never changes)
  confirmTone: {
    calm: () => 'Want me to go ahead?',
    supportive: () => "I've got you. Want me to proceed safely?",
    playful: () => 'Easy win. Want me to handle it?',
    fast: () => 'Ready to execute—say go.',
  },

  // Failure UX pattern: Acknowledge → What failed → Why → Options
  failure: (args: { whatFailed: string; why?: string; nextOptions: string[] }) => {
    const whyLine = args.why ? `Why: ${args.why}` : '';
    const options = args.nextOptions.map((o, i) => `${i + 1}) ${o}`).join('\n');
    return [
      'Okay—pause. I hit a snag.',
      `What failed: ${args.whatFailed}`,
      whyLine,
      'What we can do next:',
      options,
    ]
      .filter(Boolean)
      .join('\n');
  },

  deEscalate: () =>
    "I hear you. We'll keep this simple and get you moving again—one clean step at a time.",
};
