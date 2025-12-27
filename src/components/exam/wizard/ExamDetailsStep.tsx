import { format } from "date-fns";
import { Calendar, ChevronDown, Clock, FolderOpen, GraduationCap, Plus, Shield, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ExamFormData } from "../CreateExamWizard";
import { Course } from "@/hooks/useCourses";
import { useState } from "react";

interface ExamDetailsStepProps {
  formData: ExamFormData;
  setFormData: React.Dispatch<React.SetStateAction<ExamFormData>>;
  courses: Course[];
  coursesLoading: boolean;
  onNext: () => void;
}

export default function ExamDetailsStep({
  formData,
  setFormData,
  courses,
  coursesLoading,
  onNext,
}: ExamDetailsStepProps) {
  const [isCoursesOpen, setIsCoursesOpen] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header Card */}
      <div className="rounded-xl lg:rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-purple-500/20 border border-primary/30 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Create New Exam</h1>
            <p className="text-muted-foreground text-sm lg:text-base mt-1">
              Set up your exam with AI-powered assessment
            </p>
          </div>
          <Button onClick={onNext} className="hidden lg:flex px-6">
            Continue to Add Questions
          </Button>
        </div>
      </div>

      {/* Exam Details Section */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border/40">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Exam Details</h2>
            </div>
            
            {/* Settings Toggles - Stack on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full bg-muted/50 border border-border/40">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">AI Protection</span>
                </div>
                <Switch
                  checked={formData.aiProtection}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, aiProtection: checked })
                  }
                />
              </div>
              
              <div className="flex items-center justify-between sm:justify-start gap-2 px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full bg-muted/50 border border-border/40">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-primary" />
                  <span className="text-sm">Randomize Order</span>
                </div>
                <Switch
                  checked={formData.randomizeOrder}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, randomizeOrder: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 space-y-5 lg:space-y-6">
          {/* Exam Name */}
          <div className="space-y-2">
            <Label htmlFor="examName" className="text-primary">
              Exam Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="examName"
              placeholder="Enter exam name"
              value={formData.examName}
              onChange={(e) =>
                setFormData({ ...formData, examName: e.target.value })
              }
              className="bg-muted/30 border-border/40 h-12"
            />
          </div>

          {/* Date and Time - Stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {/* Start Date & Time */}
            <div className="space-y-2">
              <Label className="text-primary">
                Start Date & Time <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal bg-muted/30 border-border/40 h-12",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formData.startDate ? (
                          format(formData.startDate, "MMM dd, yyyy")
                        ) : (
                          "Pick a date"
                        )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.startDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, startDate: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="relative w-28">
                  <div className="flex items-center gap-2 h-12 px-3 rounded-md bg-muted/30 border border-border/40">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="border-0 bg-transparent p-0 h-auto text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                End Date & Time <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal bg-muted/30 border-border/40 h-12",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formData.endDate ? (
                          format(formData.endDate, "MMM dd, yyyy")
                        ) : (
                          "Pick a date"
                        )}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) =>
                        setFormData({ ...formData, endDate: date })
                      }
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <div className="relative w-28">
                  <div className="flex items-center gap-2 h-12 px-3 rounded-md bg-muted/30 border border-border/40">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="border-0 bg-transparent p-0 h-auto text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Selection Section */}
      <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
        <div className="p-4 border-b border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-lg font-semibold text-cyan-400">Course Selection</h2>
        </div>

        <div className="p-4 lg:p-6">
          {/* Info Box */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-start lg:items-center gap-3 mb-4 lg:mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary text-sm lg:text-base">Select a course to continue</p>
              <p className="text-xs lg:text-sm text-muted-foreground">Choose from your courses below</p>
            </div>
          </div>

          {/* Courses List */}
          <Collapsible open={isCoursesOpen} onOpenChange={setIsCoursesOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <ChevronDown className={cn("w-4 h-4 transition-transform", isCoursesOpen && "rotate-180")} />
              <span className="font-medium">No Section</span>
              <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted/50">
                {courses.length} courses
              </span>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-1 mt-2">
              {coursesLoading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  Loading courses...
                </div>
              ) : courses.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">
                  No courses found. Create a course first.
                </div>
              ) : (
                courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        courseId: formData.courseId === course.id ? null : course.id,
                      })
                    }
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                      formData.courseId === course.id
                        ? "bg-primary/20 border border-primary/40"
                        : "hover:bg-muted/30"
                    )}
                  >
                    <FolderOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium flex-1 truncate">{course.title}</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground -rotate-90 flex-shrink-0" />
                  </button>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Create Course Button */}
          <button className="w-full mt-4 py-3 rounded-lg border border-dashed border-border/60 text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted/30 transition-colors text-sm">
            <Plus className="w-4 h-4" />
            Create Course
          </button>
        </div>
      </div>
    </div>
  );
}
