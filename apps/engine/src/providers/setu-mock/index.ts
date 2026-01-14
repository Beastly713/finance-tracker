import { addDays, format, subDays } from "date-fns";
import type { BankingProvider } from "../interface";
import type { Account, Transaction } from "../../common/schema";

// Helper to generate random Indian names/merchants
const MERCHANTS = [
  "Swiggy", "Zomato", "Uber India", "Reliance Jio", "Airtel Postpaid", 
  "Zerodha Broking", "Razorpay Software", "Amazon India", "Flipkart Internet", 
  "Starbucks Tata", "BluSmart Mobility"
];

const UPI_HANDLES = ["okicici", "okhdfc", "ybl", "axl", "paytm"];

export class SetuMockProvider implements BankingProvider {
  async createLinkToken(userId: string) {
    return {
      linkUrl: `https://mock-aa.finance-tracker.com/connect?user=${userId}`,
      referenceId: crypto.randomUUID(),
    };
  }

  async exchangeToken(publicToken: string) {
    // In a real flow, we would validate the publicToken with Setu
    return {
      accessToken: `mock_access_${crypto.randomUUID()}`,
      connectionId: `conn_${crypto.randomUUID()}`,
    };
  }

  async getAccounts(accessToken: string): Promise<Account[]> {
    return [
      {
        id: "acc_hdfc_savings_01",
        name: "HDFC Savings Account",
        currency: "INR",
        type: "depository",
        balance: {
          current: 125000.50,
          available: 125000.50,
        },
        institutionId: "HDFC",
      },
      {
        id: "acc_icici_current_02",
        name: "ICICI Current Account",
        currency: "INR",
        type: "depository",
        balance: {
          current: 5400000.00, // 54 Lakhs
          available: 5400000.00,
        },
        institutionId: "ICICI",
      }
    ];
  }

  async getTransactions(accessToken: string, accountId: string, from: string, to: string): Promise<Transaction[]> {
    const transactions: Transaction[] = [];
    const days = 30; // Generate last 30 days of data

    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      
      // Generate 1-3 transactions per day
      const count = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < count; j++) {
        const isCredit = Math.random() > 0.7; // 30% chance of income
        const amount = isCredit 
          ? Math.floor(Math.random() * 50000) + 1000 
          : Math.floor(Math.random() * 5000) + 100;
        
        const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
        const upiHandle = UPI_HANDLES[Math.floor(Math.random() * UPI_HANDLES.length)];
        
        // Simulate a raw UPI string often found in bank statements
        const description = `UPI/${Math.floor(Math.random() * 10000000)}/${merchant.toUpperCase()}/${merchant.toLowerCase().replace(/\s/g, "")}@${upiHandle}`;

        transactions.push({
          id: `txn_${date}_${j}`,
          date,
          amount: isCredit ? amount : -amount, // Negative for expenses
          currency: "INR",
          description: description,
          method: "upi",
          status: "posted",
          category: isCredit ? "Income" : "Uncategorized",
          metadata: {
            upi_ref: `REF${Math.floor(Math.random() * 100000000)}`,
            merchant_vpa: `${merchant.toLowerCase().replace(/\s/g, "")}@${upiHandle}`
          },
          bankAccountId: accountId
        });
      }
    }

    return transactions;
  }
}