import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Shield, Loader2 } from "lucide-react";

export default function Qualify() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    isAccredited: false,
    capitalRange: "",
    investmentTimeline: "",
    primaryInterest: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.isAccredited) {
      newErrors.isAccredited = "You must confirm accredited investor status";
    }

    if (!formData.capitalRange) {
      newErrors.capitalRange = "Please select a capital range";
    }

    if (!formData.investmentTimeline) {
      newErrors.investmentTimeline = "Please select an investment timeline";
    }

    if (!formData.primaryInterest) {
      newErrors.primaryInterest = "Please select your primary interest";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Block submission if accreditation checkbox is unchecked
    if (!formData.isAccredited) {
      setErrors({ isAccredited: "You must confirm accredited investor status" });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/qualify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          isAccredited: formData.isAccredited,
          capitalRange: formData.capitalRange,
          investmentTimeline: formData.investmentTimeline,
          primaryInterest: formData.primaryInterest,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      const result = await response.json();

      // Redirect to Calendly immediately after successful submission
      // Use replace to prevent back button from returning to form
      window.location.replace("https://calendly.com/sspdealflow/30min");
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setErrors({ submit: error.message || "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Investor Qualification
            </h1>
            <p className="text-gray-600">
              Please complete this form to schedule your introductory call
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={errors.fullName ? "border-red-500" : ""}
                  required
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={errors.phone ? "border-red-500" : ""}
                  required
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Accredited Investor Checkbox */}
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="isAccredited"
                    checked={formData.isAccredited}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isAccredited: checked === true,
                      })
                    }
                    className={`mt-1 ${errors.isAccredited ? "border-red-500" : ""}`}
                  />
                  <Label
                    htmlFor="isAccredited"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    I confirm that I am an accredited investor as defined by SEC
                    Rule 501. <span className="text-red-500">*</span>
                  </Label>
                </div>
                {errors.isAccredited && (
                  <p className="text-sm text-red-500 ml-7">{errors.isAccredited}</p>
                )}
              </div>

              {/* Capital Range */}
              <div className="space-y-2">
                <Label htmlFor="capitalRange">
                  Capital range per deal <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.capitalRange}
                  onValueChange={(value) =>
                    setFormData({ ...formData, capitalRange: value })
                  }
                >
                  <SelectTrigger
                    id="capitalRange"
                    className={errors.capitalRange ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select capital range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$150,000 – $200,000">
                      $150,000 – $200,000
                    </SelectItem>
                    <SelectItem value="$200,000 – $250,000">
                      $200,000 – $250,000
                    </SelectItem>
                    <SelectItem value="$250,000+">$250,000+</SelectItem>
                    <SelectItem value="Flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
                {errors.capitalRange && (
                  <p className="text-sm text-red-500">{errors.capitalRange}</p>
                )}
              </div>

              {/* Investment Timeline */}
              <div className="space-y-2">
                <Label htmlFor="investmentTimeline">
                  Investment timeline <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.investmentTimeline}
                  onValueChange={(value) =>
                    setFormData({ ...formData, investmentTimeline: value })
                  }
                >
                  <SelectTrigger
                    id="investmentTimeline"
                    className={errors.investmentTimeline ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediately (within 30 days)">
                      Immediately (within 30 days)
                    </SelectItem>
                    <SelectItem value="1–3 months">1–3 months</SelectItem>
                    <SelectItem value="3–6 months">3–6 months</SelectItem>
                    <SelectItem value="Exploring / learning">
                      Exploring / learning
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.investmentTimeline && (
                  <p className="text-sm text-red-500">
                    {errors.investmentTimeline}
                  </p>
                )}
              </div>

              {/* Primary Interest */}
              <div className="space-y-2">
                <Label>
                  Primary interest <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={formData.primaryInterest}
                  onValueChange={(value) =>
                    setFormData({ ...formData, primaryInterest: value })
                  }
                  className={errors.primaryInterest ? "border-red-500" : ""}
                >
                  <div className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value="Structure & capital protection" id="interest1" />
                    <Label htmlFor="interest1" className="font-normal cursor-pointer">
                      Structure & capital protection
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value="Short hold periods" id="interest2" />
                    <Label htmlFor="interest2" className="font-normal cursor-pointer">
                      Short hold periods
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value="Deal-by-deal control" id="interest3" />
                    <Label htmlFor="interest3" className="font-normal cursor-pointer">
                      Deal-by-deal control
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 py-2">
                    <RadioGroupItem value="All of the above" id="interest4" />
                    <Label htmlFor="interest4" className="font-normal cursor-pointer">
                      All of the above
                    </Label>
                  </div>
                </RadioGroup>
                {errors.primaryInterest && (
                  <p className="text-sm text-red-500">{errors.primaryInterest}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Continue to Schedule Intro Call"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

