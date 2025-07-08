import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface EmployeeDetailsCardProps {
  companyName: string;
  employeeId: string;
  joinedDate: string;
}

export const EmployeeDetailsCard = ({ companyName, employeeId, joinedDate }: EmployeeDetailsCardProps) => {
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
            <p className="font-medium text-sm sm:text-base">{employeeId}</p>
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