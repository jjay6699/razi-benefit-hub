import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface EmployeeHeaderProps {
  employeeName: string;
  employeeId: string;
  onBack: () => void;
  backButtonText: string;
}

export const EmployeeHeader = ({ employeeName, employeeId, onBack, backButtonText }: EmployeeHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onBack}
          className="self-start"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {backButtonText}
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 break-words">{employeeName}</h1>
          <p className="text-primary-foreground/90 text-sm sm:text-base">Employee ID: {employeeId}</p>
        </div>
      </div>
    </div>
  );
};