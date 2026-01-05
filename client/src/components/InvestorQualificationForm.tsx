import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const qualificationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Phone number is required"),
  accreditedConfirmed: z.boolean().refine((val) => val === true, {
    message: "You must confirm you are an accredited investor",
  }),
  capitalRange: z.string().min(1, "Capital range is required"),
  investmentTimeline: z.string().min(1, "Investment timeline is required"),
  primaryInterest: z.string().min(1, "Primary interest is required"),
});

type QualificationFormData = z.infer<typeof qualificationSchema>;

interface InvestorQualificationFormProps {
  onSubmit: (data: QualificationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function InvestorQualificationForm({ onSubmit, isLoading }: InvestorQualificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QualificationFormData>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      accreditedConfirmed: false,
    },
  });

  const accreditedConfirmed = watch("accreditedConfirmed");
  const capitalRange = watch("capitalRange");
  const investmentTimeline = watch("investmentTimeline");
  const primaryInterest = watch("primaryInterest");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="John Doe"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john@example.com"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
          placeholder="(555) 123-4567"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Accredited Investor Confirmation */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="accredited"
            checked={accreditedConfirmed}
            onCheckedChange={(checked) => setValue("accreditedConfirmed", checked === true)}
            className={errors.accreditedConfirmed ? "border-red-500" : ""}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="accredited"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I confirm I am an accredited investor as defined by SEC Rule 501 *
            </Label>
            <p className="text-xs text-gray-500">
              Accredited investors typically have a net worth exceeding $1 million (excluding primary residence) or annual income exceeding $200,000 ($300,000 with spouse) for the past two years.
            </p>
          </div>
        </div>
        {errors.accreditedConfirmed && (
          <p className="text-sm text-red-500">{errors.accreditedConfirmed.message}</p>
        )}
      </div>

      {/* Capital Range */}
      <div className="space-y-2">
        <Label htmlFor="capitalRange">Capital Range per Deal *</Label>
        <Select
          value={capitalRange}
          onValueChange={(value) => setValue("capitalRange", value)}
        >
          <SelectTrigger className={errors.capitalRange ? "border-red-500" : ""}>
            <SelectValue placeholder="Select capital range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="$150k-$200k">$150k - $200k</SelectItem>
            <SelectItem value="$200k-$250k">$200k - $250k</SelectItem>
            <SelectItem value="$250k+">$250k+</SelectItem>
            <SelectItem value="Flexible">Flexible</SelectItem>
          </SelectContent>
        </Select>
        {errors.capitalRange && (
          <p className="text-sm text-red-500">{errors.capitalRange.message}</p>
        )}
      </div>

      {/* Investment Timeline */}
      <div className="space-y-2">
        <Label htmlFor="investmentTimeline">Investment Timeline *</Label>
        <Select
          value={investmentTimeline}
          onValueChange={(value) => setValue("investmentTimeline", value)}
        >
          <SelectTrigger className={errors.investmentTimeline ? "border-red-500" : ""}>
            <SelectValue placeholder="Select timeline" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Immediate (within 30 days)">Immediate (within 30 days)</SelectItem>
            <SelectItem value="1-3 months">1-3 months</SelectItem>
            <SelectItem value="3-6 months">3-6 months</SelectItem>
            <SelectItem value="Exploring options">Exploring options</SelectItem>
          </SelectContent>
        </Select>
        {errors.investmentTimeline && (
          <p className="text-sm text-red-500">{errors.investmentTimeline.message}</p>
        )}
      </div>

      {/* Primary Interest */}
      <div className="space-y-2">
        <Label>Primary Interest *</Label>
        <RadioGroup
          value={primaryInterest}
          onValueChange={(value) => setValue("primaryInterest", value)}
          className={errors.primaryInterest ? "border-red-500" : ""}
        >
          <div className="flex items-center space-x-2 py-2">
            <RadioGroupItem value="Structure & security" id="interest-structure" />
            <Label htmlFor="interest-structure" className="font-normal cursor-pointer">
              Structure & security
            </Label>
          </div>
          <div className="flex items-center space-x-2 py-2">
            <RadioGroupItem value="Speed to close" id="interest-speed" />
            <Label htmlFor="interest-speed" className="font-normal cursor-pointer">
              Speed to close
            </Label>
          </div>
          <div className="flex items-center space-x-2 py-2">
            <RadioGroupItem value="Control & transparency" id="interest-control" />
            <Label htmlFor="interest-control" className="font-normal cursor-pointer">
              Control & transparency
            </Label>
          </div>
          <div className="flex items-center space-x-2 py-2">
            <RadioGroupItem value="All of the above" id="interest-all" />
            <Label htmlFor="interest-all" className="font-normal cursor-pointer">
              All of the above
            </Label>
          </div>
        </RadioGroup>
        {errors.primaryInterest && (
          <p className="text-sm text-red-500">{errors.primaryInterest.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full h-12 text-base font-semibold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          "Continue to Schedule Call"
        )}
      </Button>
    </form>
  );
}

