// INSTALL LOGIC
document.getElementById('install-btn').addEventListener('click', () => {
  window.location.href =
    'https://downloads.rinawarptech.com/terminal-pro/0.9.0/RinaWarp-Terminal-Pro-Linux.AppImage';
});

// CHECKOUT LOGIC
document.getElementById('buy-btn').addEventListener('click', async () => {
  try {
    const res = await fetch('/api/checkout?product=terminal-pro');
    const data = await res.json();
    if (data?.url) {
      window.location.href = data.url;
    } else {
      alert('Checkout failed.');
    }
  } catch (err) {
    alert('Error connecting to checkout.');
  }
});
