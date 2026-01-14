import { format as dateFnsFormat } from "date-fns";

// Use 'en-IN' locale for currency
export const formatCurrency = (amount: number, currency = "INR") => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0, // In India, we often display round numbers for large values
    maximumFractionDigits: 2,
  }).format(amount);
};

// Standard Date Format DD/MM/YYYY
export const formatDate = (date: Date | string | number) => {
  const d = new Date(date);
  return dateFnsFormat(d, "dd/MM/yyyy");
};

// Compact number format (Lakhs/Crores)
// Note: Intl.NumberFormat has limited support for "lakhs" in some environments,
// but 'en-IN' usually handles the commas (1,00,000) correctly.
export const formatCompactNumber = (number: number) => {
  const formatter = new Intl.NumberFormat("en-IN", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });
  return formatter.format(number);
};