function startCheckout(plan) {
  const isPreview =
    location.hostname.includes('pages.dev') ||
    location.hostname.includes('localhost');

  if (isPreview) {
    alert('Checkout is available on the live site only.');
    return;
  }

  window.location.href = `/api/checkout-v2?plan=${plan}`;
}