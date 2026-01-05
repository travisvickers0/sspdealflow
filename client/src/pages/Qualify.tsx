import { InvestorQualificationForm } from "@/components/InvestorQualificationForm";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { ShieldCheck } from "lucide-react";

type QualificationFormData = {
  name: string;
  email: string;
  phone: string;
  accreditedConfirmed: boolean;
  capitalRange: string;
  investmentTimeline: string;
  primaryInterest: string;
};

export default function Qualify() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (data: QualificationFormData) => {
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit form");
      }

      const result = await response.json();
      
      // Show success toast
      toast({
        title: "Form submitted successfully",
        description: "Redirecting to calendar...",
      });

      // Redirect to Calendly
      if (result.calendlyLink) {
        window.location.href = result.calendlyLink;
      } else {
        // Fallback to default Calendly URL
        window.location.href = "https://calendly.com/sspdealflow/30min";
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 sm:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Investor Qualification
            </h1>
          </div>
          <p className="text-gray-600 max-w-xl mx-auto">
            Please complete this form to schedule your 30-minute intro call. All fields are required.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <InvestorQualificationForm onSubmit={handleSubmit} />
        </div>

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Accredited investors only. Not a solicitation. Your information is secure and will only be used to schedule your intro call.
          </p>
        </div>
      </div>
    </div>
  );
}

