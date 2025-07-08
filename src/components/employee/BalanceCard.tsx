import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Edit, Save, X } from 'lucide-react';

interface BalanceCardProps {
  title: string;
  balance: number;
  isEditing: boolean;
  editValue: string;
  isAdmin: boolean;
  isUpdating: boolean;
  showBadge?: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onValueChange: (value: string) => void;
}

export const BalanceCard = ({
  title,
  balance,
  isEditing,
  editValue,
  isAdmin,
  isUpdating,
  showBadge = false,
  onStartEdit,
  onCancelEdit,
  onSave,
  onValueChange
}: BalanceCardProps) => {
  return (
    <Card className={showBadge ? "sm:col-span-2 lg:col-span-1" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
            {title}
          </div>
          {isAdmin && !isEditing && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onStartEdit}
              disabled={isUpdating}
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-3">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={editValue}
              onChange={(e) => onValueChange(e.target.value)}
              disabled={isUpdating}
              className="text-lg font-semibold"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={onSave}
                disabled={isUpdating || !editValue}
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              RM {balance.toFixed(2)}
            </div>
            {showBadge && (
              <Badge variant={balance > 0 ? "default" : "secondary"} className="mt-2">
                {balance > 0 ? "Active" : "Depleted"}
              </Badge>
            )}
            {!showBadge && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Total allocated for the year
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};