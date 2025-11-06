import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

export interface Step {
    id: string;
    label: string;
    description?: string;
}

interface ProgressStepperProps {
    steps: Step[];
    currentStep: number;
    className?: string;
}

export function ProgressStepper({
    steps,
    currentStep,
    className,
}: ProgressStepperProps) {
    return (
        <div className={cn('w-full', className)}>
            {/* Mobile: Current Step Indicator */}
            <div className="block md:hidden">
                <div className="rounded-lg border-2 border-border bg-background p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Step {currentStep + 1} of {steps.length}</span>
                        <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                    </div>
                    <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gold"
                        />
                    </div>
                    <p className="font-bold uppercase tracking-wide text-foreground">
                        {steps[currentStep]?.label}
                    </p>
                    {steps[currentStep]?.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {steps[currentStep].description}
                        </p>
                    )}
                </div>
            </div>

            {/* Desktop: Full Stepper */}
            <div className="hidden md:block">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;
                        const isUpcoming = index > currentStep;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-1 items-center"
                            >
                                <div className="flex flex-col items-center">
                                    {/* Step Circle */}
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            scale: isCurrent ? 1.1 : 1,
                                        }}
                                        className={cn(
                                            'relative z-10 flex size-10 items-center justify-center rounded-full border-2 font-bold transition-colors',
                                            isCompleted &&
                                                'border-gold bg-gold text-white',
                                            isCurrent &&
                                                'border-gold bg-background text-gold ring-4 ring-gold/20',
                                            isUpcoming &&
                                                'border-border bg-background text-muted-foreground',
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="size-5" />
                                        ) : (
                                            <span className="text-sm">
                                                {index + 1}
                                            </span>
                                        )}
                                    </motion.div>

                                    {/* Step Label */}
                                    <div className="mt-3 text-center">
                                        <p
                                            className={cn(
                                                'text-sm font-bold uppercase tracking-wide',
                                                (isCompleted || isCurrent) &&
                                                    'text-foreground',
                                                isUpcoming &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {step.label}
                                        </p>
                                        {step.description && isCurrent && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="relative -mt-8 flex-1 px-4">
                                        <div className="h-0.5 w-full bg-border">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{
                                                    width:
                                                        index < currentStep
                                                            ? '100%'
                                                            : '0%',
                                                }}
                                                transition={{
                                                    duration: 0.5,
                                                    ease: 'easeOut',
                                                }}
                                                className="h-full bg-gold"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
