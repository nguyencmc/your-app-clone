import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  transition-all duration-200
                  ${isCompleted 
                    ? "bg-primary text-primary-foreground" 
                    : isCurrent 
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                      : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span
                className={`
                  mt-2 text-xs text-center
                  ${isCurrent ? "text-foreground font-medium" : "text-muted-foreground"}
                `}
              >
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={`
                  h-0.5 flex-1 mx-2 -mt-6
                  ${isCompleted ? "bg-primary" : "bg-muted"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
