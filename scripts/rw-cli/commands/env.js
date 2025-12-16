import chalk from 'chalk';

const requiredEnv = [
  'RW_ADMIN_EMAIL',
  'RW_ADMIN_PASSWORD',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID_TERMINAL_LIFETIME',
  'OPENAI_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV',
];

export function envCheck() {
  console.log(chalk.magenta('\n🔑 RinaWarp Env Validator\n'));

  const missing = [];

  requiredEnv.forEach((key) => {
    if (process.env[key]) {
      console.log(chalk.green(`✔ ${key} is set`));
    } else {
      console.log(chalk.red(`✘ ${key} is NOT set`));
      missing.push(key);
    }
  });

  if (missing.length === 0) {
    console.log(chalk.green('\n✨ All required env vars are set!\n'));
  } else {
    console.log(chalk.yellow('\n⚠ Missing env vars:'));
    missing.forEach((k) => console.log(chalk.yellow(`  - ${k}`)));
    console.log(
      chalk.yellow('\nAdd these to your shell exports or .env files before prod deploy.\n'),
    );
  }
}
