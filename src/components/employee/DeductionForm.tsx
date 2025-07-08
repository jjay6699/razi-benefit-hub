import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { DollarSign } from 'lucide-react';
import { McDatePicker } from './McDatePicker';
import { calculateDaysDifference } from '@/utils/dateUtils';

interface DeductionFormData {
  amount: string;
  description: string;
  diagnosis: string;
  medicalLeave: boolean;
  mcDateFrom?: Date;
  mcDateTo?: Date;
}

interface DeductionFormProps {
  availableBalance: number;
  processing: boolean;
  onSubmit: (data: DeductionFormData) => void;
  onReset: () => void;
}

export const DeductionForm = ({ 
  availableBalance, 
  processing, 
  onSubmit,
  onReset 
}: DeductionFormProps) => {
  const [formData, setFormData] = useState<DeductionFormData>({
    amount: '',
    description: '',
    diagnosis: '',
    medicalLeave: false,
    mcDateFrom: undefined,
    mcDateTo: undefined,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    // Reset form after successful submission
    setFormData({
      amount: '',
      description: '',
      diagnosis: '',
      medicalLeave: false,
      mcDateFrom: undefined,
      mcDateTo: undefined,
    });
    onReset();
  };

  const isFormValid = () => {
    if (!formData.amount || !formData.description || availableBalance <= 0) {
      return false;
    }
    if (formData.medicalLeave && (!formData.mcDateFrom || !formData.mcDateTo)) {
      return false;
    }
    return true;
  };

  const updateFormData = (field: keyof DeductionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Process Deduction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Deduction Amount (RM) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={availableBalance}
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => updateFormData('amount', e.target.value)}
                disabled={processing}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-muted-foreground">
                Available: RM {availableBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="description"
                type="text"
                placeholder="Medical consultation, medicine, etc."
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                disabled={processing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="text-sm font-medium">
              Diagnosis (Optional)
            </Label>
            <Input
              id="diagnosis"
              type="text"
              placeholder="e.g., Fever, Headache, etc."
              value={formData.diagnosis}
              onChange={(e) => updateFormData('diagnosis', e.target.value)}
              disabled={processing}
            />
          </div>

          <div className="space-y-4 p-4 bg-muted/30 rounded-md">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="medicalLeave"
                checked={formData.medicalLeave}
                onCheckedChange={(checked) => updateFormData('medicalLeave', !!checked)}
                disabled={processing}
              />
              <Label htmlFor="medicalLeave" className="text-sm font-medium cursor-pointer">
                Medical Leave (MC) Granted
              </Label>
            </div>
            
            {formData.medicalLeave && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <McDatePicker
                  label="MC Date From"
                  date={formData.mcDateFrom}
                  onDateChange={(date) => updateFormData('mcDateFrom', date)}
                  disabled={processing}
                  required
                />

                <McDatePicker
                  label="MC Date To"
                  date={formData.mcDateTo}
                  onDateChange={(date) => updateFormData('mcDateTo', date)}
                  disabled={processing}
                  minDate={formData.mcDateFrom}
                  required
                />
                
                {formData.mcDateFrom && formData.mcDateTo && (
                  <div className="col-span-full">
                    <p className="text-sm text-muted-foreground">
                      Duration: {calculateDaysDifference(formData.mcDateFrom, formData.mcDateTo)} day(s)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button 
            onClick={handleSubmit}
            disabled={processing || !isFormValid()}
            className="w-full mt-6"
            size="lg"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Process Deduction
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};