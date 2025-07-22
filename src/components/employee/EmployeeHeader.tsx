import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Check, X } from 'lucide-react';

interface EmployeeHeaderProps {
  employeeName: string;
  employeeId: string;
  onBack: () => void;
  backButtonText: string;
  isAdmin?: boolean;
  isEditingName?: boolean;
  editNameValue?: string;
  isUpdating?: boolean;
  onStartEditName?: () => void;
  onCancelEditName?: () => void;
  onSaveName?: () => void;
  onNameValueChange?: (value: string) => void;
}

export const EmployeeHeader = ({ 
  employeeName, 
  employeeId, 
  onBack, 
  backButtonText, 
  isAdmin,
  isEditingName,
  editNameValue,
  isUpdating,
  onStartEditName,
  onCancelEditName,
  onSaveName,
  onNameValueChange
}: EmployeeHeaderProps) => {
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
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={editNameValue}
                  onChange={(e) => onNameValueChange?.(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold bg-white/10 border-white/20 text-primary-foreground placeholder:text-primary-foreground/60"
                  disabled={isUpdating}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSaveName}
                  disabled={isUpdating}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCancelEditName}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold break-words">{employeeName}</h1>
                {isAdmin && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onStartEditName}
                    className="ml-2"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
          <p className="text-primary-foreground/90 text-sm sm:text-base">Employee ID: {employeeId}</p>
        </div>
      </div>
    </div>
  );
};