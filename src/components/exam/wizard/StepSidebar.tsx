import { Check, GripVertical } from "lucide-react";
import { Question } from "../CreateExamWizard";

interface StepSidebarProps {
  currentStep: number;
  getStepStatus: (step: number) => "completed" | "current" | "upcoming";
  onStepClick: (step: number) => void;
  questions: Question[];
  showQuestionsList: boolean;
}

const steps = [
  { number: 1, title: "Exam Details", subtitle: "Basic information" },
  { number: 2, title: "Add Questions", subtitle: "Create questions" },
  { number: 3, title: "Review", subtitle: "Final check" },
];

export default function StepSidebar({
  currentStep,
  getStepStatus,
  onStepClick,
  questions,
  showQuestionsList,
}: StepSidebarProps) {
  return (
    <div className="w-72 border-r border-border/40 bg-card/30 p-6 flex flex-col gap-6">
      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step) => {
          const status = getStepStatus(step.number);
          return (
            <button
              key={step.number}
              onClick={() => onStepClick(step.number)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                status === "current"
                  ? "bg-primary/10"
                  : status === "completed"
                  ? "hover:bg-muted/50"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  status === "completed"
                    ? "bg-green-500 text-white"
                    : status === "current"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {status === "completed" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div>
                <div
                  className={`font-medium ${
                    status === "upcoming" ? "text-muted-foreground" : ""
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {step.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Questions List (shown in step 2) */}
      {showQuestionsList && questions.length > 0 && (
        <div className="flex-1 overflow-auto">
          <h3 className="font-semibold mb-3">Questions</h3>
          <div className="space-y-2">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                    q.type === "multiple_choice"
                      ? "bg-primary/20 text-primary"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="flex-1 text-sm truncate">
                  {q.question.slice(0, 20)}...
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    q.type === "multiple_choice"
                      ? "bg-primary"
                      : "bg-orange-400"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Add question buttons */}
          <div className="mt-4 space-y-2">
            <button className="w-full py-2 px-3 rounded-lg bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors">
              + Multiple Choice
            </button>
            <button className="w-full py-2 px-3 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              + Long Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
