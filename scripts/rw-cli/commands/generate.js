import chalk from "chalk";
import fs from "fs";

export function generate(type, name) {
  console.log(chalk.magenta(`\n✨ RinaWarp Generator — Creating ${type}: ${name}\n`));

  switch (type) {
    case "page":
      fs.writeFileSync(`apps/website/public/${name}.html`,
        `<!-- Generated page: ${name} -->`);
      console.log(chalk.green(`✔ Page created: ${name}.html`));
      break;

    case "component":
      fs.writeFileSync(`apps/website/src/${name}.jsx`,
        `export default function ${name}() { return <>${name}</>; }`);
      console.log(chalk.green(`✔ Component created: ${name}.jsx`));
      break;

    case "service":
      fs.writeFileSync(`services/api/src/${name}.ts`,
        `export const ${name} = () => { return "service ok"; };`);
      console.log(chalk.green(`✔ Service created: ${name}.ts`));
      break;

    default:
      console.log(chalk.red("❌ Unknown generate type"));
  }
}