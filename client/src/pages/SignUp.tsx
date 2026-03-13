import { Button } from "@/components/ui/button";
import { Github, Mail, Apple, Eye, EyeOff } from "lucide-react";
import airbnbHero from "@assets/generated_images/clean_airbnb-style_minimal_warm_gradient_background.png";
import { useState } from "react";
import { Link } from "wouter";

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  const handleSimpleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/register/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const data = await response.json();
        setError(data.message || "Registration failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Registration failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white">
      <div className="absolute inset-0 opacity-50">
        <img 
          src={airbnbHero}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="hidden sm:block absolute top-32 right-32 w-72 h-72 bg-primary/5 rounded-full filter blur-3xl animate-pulse" />
      <div className="hidden sm:block absolute bottom-20 left-20 w-64 h-64 bg-orange-200/10 rounded-full filter blur-3xl animate-pulse delay-1000" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Join SSP
            </h1>
            <p className="text-base text-gray-600">
              Create your account to explore exclusive real estate investment opportunities
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-white/70 backdrop-blur border border-gray-200/50 rounded-2xl shadow-lg space-y-6">
            <form onSubmit={handleSimpleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    data-testid="input-first-name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/80"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    data-testid="input-last-name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/80"
                    required
                  />
                </div>
              </div>
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  data-testid="input-email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/80"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  data-testid="input-password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white/80 pr-12"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm text-center" data-testid="text-signup-error">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading}
                data-testid="button-signup-submit"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="h-5 w-5" />
                <span>Create Account</span>
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/70 backdrop-blur text-gray-600">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSignUp}
                disabled={isLoading}
                data-testid="button-signup-google"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white/80 text-gray-900 font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                onClick={handleSignUp}
                disabled={isLoading}
                data-testid="button-signup-github"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white/80 text-gray-900 font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </button>

              <button
                onClick={handleSignUp}
                disabled={isLoading}
                data-testid="button-signup-apple"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 hover:border-gray-400 bg-white/50 hover:bg-white/80 text-gray-900 font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Apple className="h-5 w-5" />
                <span>Apple</span>
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
            </p>
          </div>

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline font-semibold">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              Only accredited investors can participate in SSP opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
