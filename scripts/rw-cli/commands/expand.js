export function expand(task) {
  console.log('\n🧩 RinaWarp Task Expander\n');

  console.log('Original Task:');
  console.log(' - ' + task);

  console.log('\nExpanded Atomic Steps:\n');

  const steps = [
    '1. Clarify requirements',
    '2. Identify affected files',
    '3. Validate system dependencies',
    '4. Draft solution outline',
    '5. Execute Step 1 of implementation',
    '6. Request confirmation before Step 2',
    '7. Run tests',
    '8. Validate success',
  ];

  steps.forEach((s) => console.log(s));
}
