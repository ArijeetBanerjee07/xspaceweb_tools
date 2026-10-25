"use client";

import { cn } from "@/lib/utils";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  createContext,
  Children,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowRight,
  Mail,
  Gem,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  AlertCircle,
  PartyPopper,
  Loader,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useInView,
  Variants,
  Transition,
} from "framer-motion";
import { signIn } from "next-auth/react";
import type {
  GlobalOptions as ConfettiGlobalOptions,
  CreateTypes as ConfettiInstance,
  Options as ConfettiOptions,
} from "canvas-confetti";
import confetti from "canvas-confetti";

// --- CONFETTI LOGIC ---
type Api = { fire: (options?: ConfettiOptions) => void };
export type ConfettiRef = Api | null;
const ConfettiContext = createContext<Api>({} as Api);

const Confetti = forwardRef<
  ConfettiRef,
  React.ComponentPropsWithRef<"canvas"> & {
    options?: ConfettiOptions;
    globalOptions?: ConfettiGlobalOptions;
    manualstart?: boolean;
  }
>((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    ...rest
  } = props;
  const instanceRef = useRef<ConfettiInstance | null>(null);
  const canvasRef = useCallback(
    (node: HTMLCanvasElement) => {
      if (node !== null) {
        if (instanceRef.current) return;
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      } else {
        if (instanceRef.current) {
          instanceRef.current.reset();
          instanceRef.current = null;
        }
      }
    },
    [globalOptions]
  );
  const fire = useCallback(
    (opts = {}) => instanceRef.current?.({ ...options, ...opts }),
    [options]
  );
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => {
    if (!manualstart) fire();
  }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = "Confetti";

// --- TEXT LOOP ANIMATION COMPONENT ---
type TextLoopProps = {
  children: React.ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  stopOnEnd?: boolean;
};

export function TextLoop({
  children,
  className,
  interval = 1.4,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  stopOnEnd = false,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <div className={cn("relative inline-block whitespace-nowrap", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants || motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- BUILT-IN BLUR FADE ANIMATION COMPONENT ---
interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  variant?: { hidden: { y: number }; visible: { y: number } };
  duration?: number;
  delay?: number;
  yOffset?: number;
  inView?: boolean;
  inViewMargin?: string;
  blur?: string;
}

function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  yOffset = 6,
  inView = true,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin as any });
  const isInView = !inView || inViewResult;
  const defaultVariants: Variants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      exit="hidden"
      variants={combinedVariants}
      transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- GLASS BUTTON COMPONENT ---
const glassButtonVariants = cva(
  "relative isolate cursor-pointer rounded-full transition-all inline-flex items-center justify-center font-medium",
  {
    variants: {
      size: {
        default: "text-base px-6 py-3",
        sm: "text-xs px-4 py-2",
        lg: "text-lg px-8 py-4",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { size: "default" },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "glass-btn relative rounded-full transition-all duration-300 backdrop-blur-xl",
          "bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 hover:border-white/35",
          "shadow-lg shadow-black/40 hover:shadow-black/60 active:scale-95 text-white",
          glassButtonVariants({ size }),
          className
        )}
        {...props}
      >
        <span className={cn("relative z-10 flex items-center justify-center gap-2", contentClassName)}>
          {children}
        </span>
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

// --- THEME-AWARE SVG GRADIENT BACKGROUND (Yellow, Purple, Red, Blue, Grey) ---
const DarkGradientBackground = () => (
  <>
    <style>
      {`
        @keyframes floatSlow1 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.05); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes floatSlow2 {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(25px, -20px) scale(1.04); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}
    </style>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1000 800"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      className="absolute top-0 left-0 w-full h-full pointer-events-none select-none"
    >
      <defs>
        {/* Yellow / Golden Glow */}
        <radialGradient id="yellow_grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#d97706" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
        </radialGradient>

        {/* Purple / Magenta Glow */}
        <radialGradient id="purple_grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
        </radialGradient>

        {/* Red / Crimson Glow */}
        <radialGradient id="red_grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#dc2626" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
        </radialGradient>

        {/* Blue / Azure Glow */}
        <radialGradient id="blue_grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#1d4ed8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </radialGradient>

        {/* Grey / Slate Ambient */}
        <radialGradient id="grey_grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>

        <filter id="mesh_blur1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="85" />
        </filter>
        <filter id="mesh_blur2" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="65" />
        </filter>
        <filter id="mesh_blur3" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="110" />
        </filter>
      </defs>

      {/* Floating Ambient Mesh Layer */}
      <g style={{ animation: "floatSlow1 22s ease-in-out infinite" }}>
        {/* Yellow (Bottom Left) */}
        <circle
          cx="220"
          cy="680"
          r="260"
          fill="url(#yellow_grad)"
          filter="url(#mesh_blur1)"
        />
        {/* Purple / Violet (Upper Right) */}
        <circle
          cx="760"
          cy="260"
          r="300"
          fill="url(#purple_grad)"
          filter="url(#mesh_blur3)"
        />
      </g>

      <g style={{ animation: "floatSlow2 26s ease-in-out infinite" }}>
        {/* Red / Crimson (Lower Right) */}
        <circle
          cx="780"
          cy="660"
          r="240"
          fill="url(#red_grad)"
          filter="url(#mesh_blur2)"
        />
        {/* Blue (Upper Left) */}
        <circle
          cx="180"
          cy="200"
          r="240"
          fill="url(#blue_grad)"
          filter="url(#mesh_blur2)"
        />
        {/* Grey smoke (Center) */}
        <ellipse
          cx="480"
          cy="440"
          rx="320"
          ry="240"
          fill="url(#grey_grad)"
          filter="url(#mesh_blur3)"
          opacity="0.35"
        />
      </g>
    </svg>
  </>
);

// --- SOCIAL ICONS ---
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-4 h-4">
    <g fillRule="evenodd" fill="none">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path
          fill="#4285F4"
          d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"
        />
        <path
          fill="#34A853"
          d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"
        />
        <path
          fill="#FBBC05"
          d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"
        />
        <path
          fill="#EB4335"
          d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"
        />
      </g>
    </g>
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className="w-4 h-4">
    <path
      fill="currentColor"
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

const signupModalSteps = [
  { message: "Creating your account...", icon: <Loader className="w-10 h-10 text-blue-400 animate-spin" /> },
  { message: "Initializing your workspace...", icon: <Loader className="w-10 h-10 text-indigo-400 animate-spin" /> },
  { message: "Setting up free tier...", icon: <Loader className="w-10 h-10 text-purple-400 animate-spin" /> },
  { message: "Welcome Aboard!", icon: <PartyPopper className="w-10 h-10 text-emerald-400" /> },
];

const loginModalSteps = [
  { message: "Verifying credentials...", icon: <Loader className="w-10 h-10 text-blue-400 animate-spin" /> },
  { message: "Signing you in...", icon: <Loader className="w-10 h-10 text-indigo-400 animate-spin" /> },
  { message: "Connecting workspace...", icon: <Loader className="w-10 h-10 text-purple-400 animate-spin" /> },
  { message: "Welcome Back!", icon: <PartyPopper className="w-10 h-10 text-emerald-400" /> },
];

const TEXT_LOOP_INTERVAL = 1.2;

const DefaultLogo = () => (
  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
    <Gem className="h-4 w-4" />
  </div>
);

// --- MAIN AUTH COMPONENT ---
export interface AuthComponentProps {
  logo?: React.ReactNode;
  brandName?: string;
  onSuccess?: () => void;
  initialMode?: "signin" | "signup";
}

export const AuthComponent = ({
  logo = <DefaultLogo />,
  brandName = "MyWebApp",
  onSuccess,
  initialMode = "signin",
}: AuthComponentProps) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authStep, setAuthStep] = useState<"email" | "password" | "confirmPassword">("email");
  const [modalStatus, setModalStatus] = useState<"closed" | "loading" | "error" | "success">("closed");
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const confettiRef = useRef<ConfettiRef>(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmPasswordValid = confirmPassword.length >= 6;

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const activeModalSteps = mode === "signin" ? loginModalSteps : signupModalSteps;

  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 9999 };
      fire({ ...defaults, particleCount: 60, origin: { x: 0, y: 0.9 }, angle: 60 });
      fire({ ...defaults, particleCount: 60, origin: { x: 1, y: 0.9 }, angle: 120 });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalStatus !== "closed") return;

    if (mode === "signin") {
      if (!isPasswordValid) return;
      setModalStatus("loading");
      setModalErrorMessage("");

      try {
        const res = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (!res || res.error) {
          setModalErrorMessage("Invalid email or password. Please verify your credentials or create a new account.");
          setModalStatus("error");
          return;
        }

        setModalStatus("success");
        fireSideCanons();
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = "/app";
          }
        }, 700);
      } catch (err: any) {
        setModalErrorMessage(err?.message || "Failed to sign in. Please try again.");
        setModalStatus("error");
      }
    } else {
      // Sign-up flow
      if (authStep !== "confirmPassword") {
        if (isPasswordValid) setAuthStep("confirmPassword");
        return;
      }

      if (password !== confirmPassword) {
        setModalErrorMessage("Passwords do not match!");
        setModalStatus("error");
        return;
      }

      setModalStatus("loading");
      setModalErrorMessage("");

      try {
        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        });

        const data = await signupRes.json();

        if (signupRes.status === 409) {
          // Account exists, attempt logging in with credentials
          const loginRes = await signIn("credentials", {
            email: email.trim().toLowerCase(),
            password,
            redirect: false,
          });

          if (loginRes?.ok) {
            setModalStatus("success");
            fireSideCanons();
            setTimeout(() => {
              if (onSuccess) {
                onSuccess();
              } else {
                window.location.href = "/app";
              }
            }, 700);
            return;
          }

          setModalErrorMessage("An account with this email already exists. Please log in with your password.");
          setModalStatus("error");
          setMode("signin");
          setAuthStep("password");
          return;
        }

        if (!signupRes.ok) {
          setModalErrorMessage(data.error || data.message || "Failed to create account.");
          setModalStatus("error");
          return;
        }

        // Account created! Now log in to set the NextAuth session cookie
        const loginRes = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (!loginRes?.ok) {
          setModalErrorMessage("Account created! Please log in with your password.");
          setModalStatus("error");
          setMode("signin");
          setAuthStep("password");
          return;
        }

        // Clean any leftover Pro cache in localStorage for fresh free account
        try {
          localStorage.removeItem("otk_is_pro");
          localStorage.removeItem("otk_pro_expires_at");
        } catch {}

        setModalStatus("success");
        fireSideCanons();
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = "/app";
          }
        }, 700);
      } catch (err: any) {
        setModalErrorMessage(err?.message || "Registration failed. Please try again.");
        setModalStatus("error");
      }
    }
  };

  const handleProgressStep = () => {
    if (authStep === "email") {
      if (isEmailValid) setAuthStep("password");
    } else if (authStep === "password") {
      if (mode === "signin") {
        if (isPasswordValid) {
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          handleFinalSubmit(fakeEvent);
        }
      } else if (isPasswordValid) {
        setAuthStep("confirmPassword");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (authStep === "email" && isEmailValid) {
        handleProgressStep();
      } else if (authStep === "password") {
        if (mode === "signin" && isPasswordValid) {
          handleFinalSubmit(e);
        } else if (mode === "signup" && isPasswordValid) {
          handleProgressStep();
        }
      } else if (authStep === "confirmPassword" && isConfirmPasswordValid) {
        handleFinalSubmit(e);
      }
    }
  };

  const handleGoBack = () => {
    if (authStep === "confirmPassword") {
      setAuthStep("password");
      setConfirmPassword("");
    } else if (authStep === "password") {
      setAuthStep("email");
    }
  };

  const closeModal = () => {
    setModalStatus("closed");
    setModalErrorMessage("");
  };

  useEffect(() => {
    if (authStep === "password") {
      setTimeout(() => passwordInputRef.current?.focus(), 350);
    } else if (authStep === "confirmPassword") {
      setTimeout(() => confirmPasswordInputRef.current?.focus(), 350);
    } else if (authStep === "email") {
      setTimeout(() => emailInputRef.current?.focus(), 350);
    }
  }, [authStep]);

  useEffect(() => {
    if (modalStatus === "success") {
      fireSideCanons();
    }
  }, [modalStatus]);

  // Modal Component
  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== "closed" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-[#0d0d14]/90 border border-white/15 rounded-3xl p-8 w-full max-w-sm flex flex-col items-center gap-4 text-center text-white shadow-2xl backdrop-blur-2xl"
          >
            {(modalStatus === "error" || modalStatus === "success") && (
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white transition-colors rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {modalStatus === "error" && (
              <>
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <p className="text-base font-semibold text-white">{modalErrorMessage}</p>
                <GlassButton onClick={closeModal} size="sm" className="mt-2">
                  Try Again
                </GlassButton>
              </>
            )}

            {modalStatus === "loading" && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                {activeModalSteps.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    {step.icon}
                    <p className="text-base font-medium text-white/90">{step.message}</p>
                  </div>
                ))}
              </TextLoop>
            )}

            {modalStatus === "success" && (
              <div className="flex flex-col items-center gap-4">
                {activeModalSteps[activeModalSteps.length - 1].icon}
                <p className="text-xl font-bold text-white">
                  {activeModalSteps[activeModalSteps.length - 1].message}
                </p>
                <p className="text-xs text-white/60">Redirecting to your workspace...</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-[#07070a] text-white min-h-screen w-screen flex flex-col relative overflow-hidden select-none">
      {/* Confetti & Modal */}
      <Confetti
        ref={confettiRef}
        manualstart
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      />
      <Modal />

      {/* SVG Background with animated Yellow, Purple, Red, Blue, Grey orbs */}
      <DarkGradientBackground />

      {/* Top Brand Pill Header matching screenshot */}
      <header className="fixed top-6 left-0 right-0 z-20 flex justify-center items-center pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] backdrop-blur-xl border border-white/15 transition shadow-lg shadow-black/30 cursor-pointer">
          {logo}
          <span className="text-xs font-bold tracking-tight text-white">{brandName}</span>
        </div>
      </header>

      {/* Center Floating Content Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        <fieldset
          disabled={modalStatus !== "closed"}
          className="w-full max-w-md flex flex-col items-center text-center gap-6"
        >
          {/* Step Titles */}
          <AnimatePresence mode="wait">
            {authStep === "email" && (
              <motion.div
                key="step-email-header"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <BlurFade delay={0.1}>
                  <h1 className="font-serif font-normal text-4xl sm:text-5xl md:text-6xl tracking-tight text-white drop-shadow-sm">
                    {mode === "signin" ? "Welcome Back" : "Get started with Us"}
                  </h1>
                </BlurFade>

                <BlurFade delay={0.2}>
                  <p className="text-xs sm:text-sm font-medium text-white/50 tracking-wide">
                    {mode === "signin" ? "Sign in to access your workspace" : "Create your free workspace in seconds"}
                  </p>
                </BlurFade>

                <BlurFade delay={0.3}>
                  <div className="flex items-center justify-center pt-1">
                    <GlassButton
                      type="button"
                      size="sm"
                      onClick={() => signIn("google", { callbackUrl: "/app" })}
                      className="px-6 py-2"
                    >
                      <GoogleIcon />
                      <span className="font-semibold text-white">Google</span>
                    </GlassButton>
                  </div>
                </BlurFade>

                <BlurFade delay={0.4}>
                  <div className="flex items-center justify-center w-64 mx-auto gap-3 py-1">
                    <hr className="flex-1 border-white/15" />
                    <span className="text-[11px] font-semibold text-white/40 tracking-wider">OR</span>
                    <hr className="flex-1 border-white/15" />
                  </div>
                </BlurFade>
              </motion.div>
            )}

            {authStep === "password" && (
              <motion.div
                key="step-password-header"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h2 className="font-serif font-normal text-3xl sm:text-4xl text-white">
                  {mode === "signin" ? "Enter your password" : "Create your password"}
                </h2>
                <p className="text-xs sm:text-sm text-white/50">
                  {mode === "signin"
                    ? "Enter your password to sign in."
                    : "Your password must be at least 6 characters long."}
                </p>
              </motion.div>
            )}

            {authStep === "confirmPassword" && (
              <motion.div
                key="step-confirm-header"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h2 className="font-serif font-normal text-3xl sm:text-4xl text-white">
                  One Last Step
                </h2>
                <p className="text-xs sm:text-sm text-white/50">
                  Confirm your password to continue
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form and Input Pill */}
          <form onSubmit={handleFinalSubmit} className="w-full max-w-[340px] space-y-4">
            {/* EMAIL STEP */}
            {authStep === "email" && (
              <BlurFade delay={0.5}>
                <div className="relative w-full rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus-within:bg-white/[0.12] border border-white/20 focus-within:border-white/40 shadow-xl shadow-black/50 backdrop-blur-2xl transition-all p-1 flex items-center">
                  <div className="pl-3.5 pr-2 text-white/60 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm py-1.5 px-1 min-w-0"
                  />
                  <AnimatePresence>
                    {isEmailValid && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pr-1 shrink-0"
                      >
                        <button
                          type="button"
                          onClick={handleProgressStep}
                          aria-label="Continue with email"
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition shadow-xs"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </BlurFade>
            )}

            {/* PASSWORD STEP */}
            {authStep === "password" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="relative w-full rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus-within:bg-white/[0.12] border border-white/20 focus-within:border-white/40 shadow-xl shadow-black/50 backdrop-blur-2xl transition-all p-1 flex items-center">
                  <div className="pl-3.5 pr-2 text-white/60 shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm py-1.5 px-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                    className="p-1.5 text-white/50 hover:text-white transition-colors shrink-0 mr-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {isPasswordValid && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pr-1 shrink-0"
                      >
                        <button
                          type={mode === "signin" ? "submit" : "button"}
                          onClick={mode === "signin" ? undefined : handleProgressStep}
                          aria-label={mode === "signin" ? "Sign in" : "Proceed to confirm password"}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition shadow-xs active:scale-95",
                            mode === "signin"
                              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/40"
                              : "bg-white/20 hover:bg-white/30 text-white"
                          )}
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go back to Email</span>
                </button>
              </motion.div>
            )}

            {/* CONFIRM PASSWORD STEP */}
            {authStep === "confirmPassword" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="relative w-full rounded-full bg-white/[0.07] hover:bg-white/[0.1] focus-within:bg-white/[0.12] border border-white/20 focus-within:border-white/40 shadow-xl shadow-black/50 backdrop-blur-2xl transition-all p-1 flex items-center">
                  <div className="pl-3.5 pr-2 text-white/60 shrink-0">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    ref={confirmPasswordInputRef}
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder:text-white/40 focus:outline-none text-sm py-1.5 px-1 min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                    className="p-1.5 text-white/50 hover:text-white transition-colors shrink-0 mr-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {isConfirmPasswordValid && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pr-1 shrink-0"
                      >
                        <button
                          type="submit"
                          aria-label="Finish sign-up"
                          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition shadow-md shadow-blue-600/40"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleGoBack}
                  className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Go back to Password</span>
                </button>
              </motion.div>
            )}

            {/* TOGGLE SIGN IN / SIGN UP */}
            {authStep === "email" && (
              <div className="pt-2 text-xs text-white/60">
                {mode === "signin" ? (
                  <span>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        setModalErrorMessage("");
                      }}
                      className="font-semibold text-white underline underline-offset-4 hover:text-blue-400 cursor-pointer ml-1 transition-colors"
                    >
                      Sign up for free
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setModalErrorMessage("");
                      }}
                      className="font-semibold text-white underline underline-offset-4 hover:text-blue-400 cursor-pointer ml-1 transition-colors"
                    >
                      Sign in
                    </button>
                  </span>
                )}
              </div>
            )}
          </form>
        </fieldset>
      </main>
    </div>
  );
};
