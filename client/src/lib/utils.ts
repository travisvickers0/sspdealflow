import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Property } from "@shared/schema"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function generatePropertyDescription(property: Property): string {
  return `Located at **${property.address}, ${property.city}, ${property.state}**, this asset is secured at a purchase price of **${formatCurrency(property.purchasePrice)}**.

The deal features an After Repair Value (ARV) of **${formatCurrency(property.bpoValue)}**. With a renovation budget of **${formatCurrency(property.rehabBudget)}**, the total estimated profit available is **${formatCurrency(property.estimatedEquity)}**.`
}
