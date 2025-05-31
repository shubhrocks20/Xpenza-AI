import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {  DeleteIcon, Download } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletebill, fetchRecentUploads } from "@/http";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function RecentUploads() {
  const { data: uploads = [], isLoading: loadingRecentUploads } = useQuery({
    queryKey: ["uploads"],
    queryFn: fetchRecentUploads,
  });
  const queryClient = useQueryClient();

  const deleteBillMutation = useMutation({
    mutationFn: deletebill,
    onSuccess: (data: any) => {
      toast(data.success, {
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
    },
    onError: (err: any) => {
      toast("Error", {
        description: err.message,
      });
    }
  })
 

function formatDate(date: string) {
  return new Date(date).toISOString().split("T")[0];
}

function handleDownload(bill: any) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Bill Receipt", 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [['Field', 'Value']],
    body: [
      ['Bill ID', bill.id],
      ['Merchant', bill.merchantName],
      ['Total Amount', `₹${bill.totalAmount}`],
      ['Category', bill.category],
      ['Purchase Date', formatDate(bill.purchaseDate)],
      ['Uploaded On', formatDate(bill.createdAt)],
    ],
    styles: {
      fontSize: 12,
      cellPadding: 4
    },
    headStyles: {
      fillColor: [100, 100, 255],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240]
    }
  });

  doc.save(`bill-${bill.id}.pdf`);
}

  

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Recent Bill Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-sm text-gray-600">Merchant</TableHead>
                <TableHead className="text-sm text-gray-600">Category</TableHead>
                <TableHead className="text-sm text-gray-600">Date</TableHead>
                <TableHead className="text-sm text-gray-600">Amount</TableHead>
                <TableHead className="text-sm text-gray-600">Status</TableHead>
                <TableHead className="text-right text-sm text-gray-600">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRecentUploads
                ? Array.from({ length: 6 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton className="w-24 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-16 h-4" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-6" /></TableCell>
                      <TableCell><Skeleton className="w-20 h-6" /></TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="w-10 h-10 rounded-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : uploads.length > 0 &&
                  uploads.map((upload: any) => (
                    <TableRow key={upload.id}>
                      <TableCell className="text-sm font-medium text-gray-700">
                        {upload.merchantName.split(' ')[0]}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-700">
                        {upload.category}
                      </TableCell>
                      <TableCell  className="text-sm text-gray-600">
                        {upload.purchaseDate
                          ? new Date(upload.purchaseDate).toISOString().split("T")[0]
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-700">
                        ₹{upload.totalAmount}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={upload.status === "Processed" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {upload.status || "Completed"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="outline" onClick={() => handleDownload(upload)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              deleteBillMutation.mutate(upload.id);
                            }}
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
  
}