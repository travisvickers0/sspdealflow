import {
  Apple,
  Eye,
  EyeOff,
  Github,
  Lock,
  Mail,
  Shield,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const inputClassName =
  "w-full bg-[#181614] border border-[#353129] rounded-[8px] text-[#f0ebe3] text-[14px] px-4 py-3 outline-none placeholder:text-[#6b6158] focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all";

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = () => {
    setIsLoading(true);
    window.location.href = "/api/login";
  };

  const handleSimpleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = "/";
      } else {
        const data = await response.json();
        setError(data.message || "Invalid email or password");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0908] flex w-full overflow-x-hidden">
      {/* Left panel — desktop only */}
      <aside className="hidden lg:flex lg:w-[45%] flex-col justify-between border-r border-[#2a2724] bg-[#181614] p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-primary rounded-[8px] grid place-items-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-[#f0ebe3] font-semibold text-[15px]">
              SSP Deal Flow
            </span>
          </div>
          <h2
            className="font-['Bebas_Neue',sans-serif] text-[56px] leading-[0.92] tracking-[0.02em] text-[#f0ebe3] mb-4"
          >
            JOIN THE
            <br />
            <span className="text-primary">DEAL ROOM</span>
          </h2>
          <p className="text-[14px] text-[#a89e91] leading-[1.8] max-w-[280px] mb-10">
            Access vetted off-market acquisitions. Deal-by-deal JV partnerships.
            50/50 profit split.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#252220] rounded-[6px] grid place-items-center text-primary flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[13px] text-[#a89e91]">
                First-position lien protection
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#252220] rounded-[6px] grid place-items-center text-primary flex-shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-[13px] text-[#a89e91]">
                50/50 profit split at sale
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#252220] rounded-[6px] grid place-items-center text-primary flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[13px] text-[#a89e91]">
                Accredited investors only
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <div>
            <p className="font-mono text-[22px] font-medium text-[#f0ebe3] leading-none mb-1">
              119
            </p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#6b6158]">
              Deals Closed
            </p>
          </div>
          <div>
            <p className="font-mono text-[22px] font-medium text-[#22c55e] leading-none mb-1">
              $6.1M
            </p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#6b6158]">
              Total Equity
            </p>
          </div>
          <div>
            <p className="font-mono text-[22px] font-medium text-[#f0ebe3] leading-none mb-1">
              94d
            </p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-[#6b6158]">
              Avg Hold
            </p>
          </div>
        </div>
      </aside>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center bg-[#0a0908] px-5 py-12 lg:px-16">
        <div className="w-full max-w-[420px]">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="w-7 h-7 bg-primary rounded-[8px] grid place-items-center text-white font-bold text-sm">
              S
            </div>
            <span className="text-[#f0ebe3] font-semibold text-[14px]">
              SSP Deal Flow
            </span>
          </div>

          <h1 className="text-[28px] font-semibold text-[#f0ebe3] tracking-tight mb-1 text-center lg:text-left">
            Welcome back
          </h1>
          <p className="text-[13px] text-[#6b6158] mb-8 text-center lg:text-left">
            Sign in to your SSP Deal Flow account.
          </p>

          <form onSubmit={handleSimpleLogin}>
            <div className="mb-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                data-testid="input-email"
                className={`${inputClassName} w-full`}
                required
              />
            </div>
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                data-testid="input-password"
                className={`${inputClassName} pr-12 w-full`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6b6158] hover:text-[#a89e91]"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm text-center mb-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              data-testid="button-signin-submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[14px] py-3.5 rounded-[8px] flex items-center justify-center gap-2 transition-all mb-4 hover:shadow-[0_8px_24px_rgba(232,67,45,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail className="h-5 w-5" />
              <span>Sign In</span>
            </button>
          </form>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-[#2a2724]" />
            <span className="text-[11px] text-[#6b6158]">or</span>
            <div className="flex-1 h-px bg-[#2a2724]" />
          </div>

          <div>
            <button
              onClick={handleSignIn}
              disabled={isLoading}
              data-testid="button-signin-google"
              className="w-full bg-[#181614] border border-[#353129] text-[#a89e91] hover:border-[#6b6158] hover:text-[#f0ebe3] hover:bg-[#201e1b] font-medium text-[13px] py-3 rounded-[8px] flex items-center justify-center gap-2.5 transition-all mb-2 last:mb-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              data-testid="button-signin-github"
              className="w-full bg-[#181614] border border-[#353129] text-[#a89e91] hover:border-[#6b6158] hover:text-[#f0ebe3] hover:bg-[#201e1b] font-medium text-[13px] py-3 rounded-[8px] flex items-center justify-center gap-2.5 transition-all mb-2 last:mb-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github className="h-5 w-5" />
              <span>GitHub</span>
            </button>

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              data-testid="button-signin-apple"
              className="w-full bg-[#181614] border border-[#353129] text-[#a89e91] hover:border-[#6b6158] hover:text-[#f0ebe3] hover:bg-[#201e1b] font-medium text-[13px] py-3 rounded-[8px] flex items-center justify-center gap-2.5 transition-all mb-2 last:mb-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Apple className="h-5 w-5" />
              <span>Apple</span>
            </button>
          </div>

          <p className="text-[11px] text-[#6b6158] text-center mt-5 leading-relaxed">
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-[#a89e91] hover:text-[#f0ebe3] transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-[#a89e91] hover:text-[#f0ebe3] transition-colors"
            >
              Privacy Policy
            </a>
          </p>

          <p className="text-[13px] text-[#6b6158] text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Sign up
            </Link>
          </p>
          <p className="text-[11px] text-[#6b6158] text-center mt-3">
            Only accredited investors can participate in SSP opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
