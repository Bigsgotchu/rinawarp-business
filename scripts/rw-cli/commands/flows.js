export function flows() {
  console.log("\n🔄 Data Flow Map\n");

  const flows = `
User → Website → Stripe Checkout → Webhook → API → DB → License
User → Terminal Pro → Auth Service → Gateway → AI Agent
Terminal Pro → Commands → Shell Exec → Logs → Frontend
`;

  console.log(flows);
}