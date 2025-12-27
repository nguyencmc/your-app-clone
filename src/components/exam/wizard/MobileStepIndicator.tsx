import { Check } from "lucide-react";

interface MobileStepIndicatorProps {
  currentStep: number;
  getStepStatus: (step: number) => "completed" | "current" | "upcoming";
}

const steps = [
  { number: 1, label: "Details" },
  { number: 2, label: "Questions" },
  { number: 3, label: "Review" },
];

export default function MobileStepIndicator({
  currentStep,
  getStepStatus,
}: MobileStepIndicatorProps) {
  return (
    <div className="px-4 py-3 border-t border-border/50 bg-card/50">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${status === "completed"
                      ? "bg-green-500 text-white"
                      : status === "current"
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }
                  `}
                >
                  {status === "completed" ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`
                    mt-1.5 text-xs text-center
                    ${status === "current" ? "text-foreground font-medium" : "text-muted-foreground"}
                  `}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`
                    h-0.5 flex-1 mx-1 -mt-5
                    ${status === "completed" ? "bg-green-500" : "bg-muted"}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
