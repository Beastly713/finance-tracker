import type { Account, Transaction } from "../common/schema";

export interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "production";
}

export interface BankingProvider {
  /**
   * Generates a link/token to initialize the frontend flow
   */
  createLinkToken(userId: string): Promise<{ linkUrl: string; referenceId: string }>;

  /**
   * Exchanges the public token/consent handle for an access token
   */
  exchangeToken(publicToken: string): Promise<{ accessToken: string; connectionId: string }>;

  /**
   * Fetches all accounts associated with a connection
   */
  getAccounts(accessToken: string): Promise<Account[]>;

  /**
   * Fetches transactions for a specific period
   */
  getTransactions(
    accessToken: string, 
    accountId: string, 
    from: string, // YYYY-MM-DD
    to: string    // YYYY-MM-DD
  ): Promise<Transaction[]>;
}