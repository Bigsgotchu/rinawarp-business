const stripe = null; // Placeholder, not used in this function

// In-memory analytics storage (for demo - in production, use a database)
interface AnalyticsData {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  lastUpdated: string;
  recentSales: Array<{
    id: string;
    customerEmail: string;
    product: string;
    amount: number;
    currency: string;
    timestamp: string;
    status: string;
  }>;
}

const analyticsData: AnalyticsData = {
  totalRevenue: 0,
  totalSales: 0,
  totalCustomers: 0,
  lastUpdated: new Date().toISOString(),
  recentSales: [],
};

// Helper function to save analytics data
async function saveAnalytics() {
  // In a real implementation, you'd save this to a database
  // For now, we'll use Netlify's file system or environment variables
  console.log('Analytics updated:', analyticsData);
}

// Helper function to load analytics data
async function loadAnalytics() {
  // In a real implementation, you'd load this from a database
  return analyticsData;
}

export default async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const data = await loadAnalytics();

    return new Response(JSON.stringify(data), {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }
};

// Function to record a sale (called by webhook)
export async function recordSale(sale: {
  id: string;
  customerEmail: string;
  product: string;
  amount: number;
  currency: string;
}) {
  try {
    const data = await loadAnalytics();

    // Update totals
    data.totalRevenue += sale.amount;
    data.totalSales += 1;

    // Check if this is a new customer
    const existingCustomer = data.recentSales.find((s) => s.customerEmail === sale.customerEmail);
    if (!existingCustomer) {
      data.totalCustomers += 1;
    }

    // Add to recent sales
    data.recentSales.unshift({
      ...sale,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });

    // Keep only last 100 sales
    if (data.recentSales.length > 100) {
      data.recentSales = data.recentSales.slice(0, 100);
    }

    data.lastUpdated = new Date().toISOString();

    // Save updated data
    await saveAnalytics();

    console.log(
      `✅ Sale recorded: ${sale.product} - $${sale.amount / 100} - ${sale.customerEmail}`,
    );
  } catch (error) {
    console.error('Failed to record sale:', error);
  }
}

// Function to get lifetime sales count for a specific product
export async function getLifetimeCount(productType: string = 'lifetime') {
  try {
    const data = await loadAnalytics();
    const lifetimeSales = data.recentSales.filter((sale) => sale.product === productType);

    return {
      sold: lifetimeSales.length,
      remaining: Math.max(0, 500 - lifetimeSales.length),
      total: 500,
    };
  } catch (error) {
    console.error('Failed to get lifetime count:', error);
    return { sold: 0, remaining: 500, total: 500 };
  }
}
