import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from '@/types';

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  loading: boolean;
}

export const TransactionHistoryTable = ({ transactions, loading }: TransactionHistoryTableProps) => {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-sm text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions found for this employee.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile View - Cards */}
      <div className="block md:hidden space-y-3">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-4">
            <CardContent className="p-0 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">RM {transaction.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Balance: RM {transaction.balanceAfter.toFixed(2)}</p>
                </div>
              </div>
              
              {transaction.diagnosis && (
                <div>
                  <p className="text-xs text-muted-foreground">Diagnosis:</p>
                  <p className="text-sm">{transaction.diagnosis}</p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-2">
                <Badge variant={transaction.medicalLeaveGranted ? "default" : "secondary"} className="text-xs">
                  {transaction.medicalLeaveGranted ? "MC Granted" : "No MC"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Diagnosis</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>MC Granted</TableHead>
              <TableHead>Balance After</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="text-sm">{new Date(transaction.date).toLocaleDateString()}</TableCell>
                <TableCell className="text-sm">{transaction.description}</TableCell>
                <TableCell>
                  {transaction.diagnosis ? (
                    <span className="text-sm">{transaction.diagnosis}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="font-medium text-sm">RM {transaction.amount.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={transaction.medicalLeaveGranted ? "default" : "secondary"} className="text-xs">
                    {transaction.medicalLeaveGranted ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">RM {transaction.balanceAfter.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};