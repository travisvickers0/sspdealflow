import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

// Declare fbq for TypeScript
declare global {
  interface Window {
    fbq: (action: string, event: string, params?: any) => void;
  }
}

export default function ThankYou() {
  const [, setLocation] = useLocation();

  // Track Schedule event when page loads (after Calendly booking)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Schedule');
    }
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            {/* Success Icon */}
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Meeting Scheduled Successfully!
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8">
              Thank you for scheduling your introductory call with SSP Deal Flow.
              We're excited to discuss your investment goals and show you our current opportunities.
            </p>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Check Your Calendar</p>
                    <p className="text-sm text-gray-600">
                      You should receive a calendar invitation with meeting details and a video link.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Check Your Email</p>
                    <p className="text-sm text-gray-600">
                      We'll send you a confirmation email with all the details you need.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/properties")}
                className="w-full sm:w-auto"
              >
                Browse Properties
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                className="w-full sm:w-auto"
              >
                Return Home
              </Button>
            </div>

            {/* Help Text */}
            <p className="mt-8 text-sm text-gray-500">
              Need to reschedule? Check your confirmation email for instructions.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

