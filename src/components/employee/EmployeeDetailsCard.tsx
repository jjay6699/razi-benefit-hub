import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Edit, Check, X } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface EmployeeDetailsCardProps {
  companyName: string;
  employeeId: string;
  joinedDate: string;
  isAdmin?: boolean;
  isEditingId?: boolean;
  editIdValue?: string;
  isUpdating?: boolean;
  onStartEditId?: () => void;
  onCancelEditId?: () => void;
  onSaveId?: () => void;
  onIdValueChange?: (value: string) => void;
}

export const EmployeeDetailsCard = ({ 
  companyName, 
  employeeId, 
  joinedDate, 
  isAdmin,
  isEditingId,
  editIdValue,
  isUpdating,
  onStartEditId,
  onCancelEditId,
  onSaveId,
  onIdValueChange
}: EmployeeDetailsCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <User className="h-4 w-4 sm:h-5 sm:w-5" />
          Employee Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Company</p>
            <p className="font-medium text-sm sm:text-base break-words">{companyName}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Employee ID</p>
            {isEditingId ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editIdValue}
                  onChange={(e) => onIdValueChange?.(e.target.value)}
                  className="text-sm sm:text-base font-medium"
                  disabled={isUpdating}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveId}
                  disabled={isUpdating}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelEditId}
                  disabled={isUpdating}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm sm:text-base">{employeeId}</p>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStartEditId}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Joined</p>
            <p className="font-medium text-sm sm:text-base">{formatDate(joinedDate)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};