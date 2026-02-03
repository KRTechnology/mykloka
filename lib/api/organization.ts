// tenantChecker.ts
const ALLOWED_TENANTS = ["one", "two"];

class TenantChecker {
  // Async to mimic real DB/API call
  async checkTenant(subdomain: string): Promise<boolean> {
    // simulate async delay (optional)
    await new Promise((resolve) => setTimeout(resolve, 10));
    return ALLOWED_TENANTS.includes(subdomain);
  }
}

export const tenantChecker = new TenantChecker();
