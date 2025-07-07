import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
            <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
            <TableCell>{transaction.description}</TableCell>
            <TableCell>
              {transaction.diagnosis ? (
                <span className="text-sm">{transaction.diagnosis}</span>
              ) : (
                <span className="text-sm text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="font-medium">RM {transaction.amount.toFixed(2)}</TableCell>
            <TableCell>
              <Badge variant={transaction.medicalLeaveGranted ? "default" : "secondary"}>
                {transaction.medicalLeaveGranted ? "Yes" : "No"}
              </Badge>
            </TableCell>
            <TableCell>RM {transaction.balanceAfter.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};