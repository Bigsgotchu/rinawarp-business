export function blueprint() {
  console.log("\n📐 Generating Architecture Blueprint\n");

  const diagram = `
terminal --> api --> gateway --> auth-service --> stripe
website --> api
admin --> gateway
  `;

  console.log(diagram);
}