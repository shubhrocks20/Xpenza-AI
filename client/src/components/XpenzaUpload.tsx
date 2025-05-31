import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";
import { Loader2, Upload } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import RecentUploads from "./RecentUploads";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { autoBill, manualBill } from "@/http";
import Instructions from "./uploadInstruction";

export default function XpenzaUpload() {
  const [file, setFile] = useState<any>(null);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
  const [merchantName, setMerchantName] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const handleFileChange = (e: any) => {
    if (e.target.files.length > 1) {
      toast("Only one file allowed", { description: "Please upload only one file at a time." });
      return;
    }
    const selectedFile = e.target.files[0];
    if (selectedFile && !["image/jpeg", "image/png"].includes(selectedFile.type)) {
      toast("Invalid file type", { description: "Only JPEG and PNG files are allowed." });
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const fileSubmitMutation = useMutation({
    mutationFn: autoBill,
    onSuccess: (data) => {
      toast(data.success, { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (err: any) => {
      console.log(err)
      toast(err.response.data.success, { description: err.response.data.message });
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const manualFormMutation = useMutation({
    mutationFn: manualBill,
    onSuccess: (data) => {
      toast(data.success, { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["uploads"] });
      setMerchantName('');
      setTotalAmount('');
      setCategory('');
      setPurchaseDate(undefined);
    },
    onError: (err: any) => {
    
      toast(err.response.data.error.message, { description: err.response.data.message });
    },
  });

  const handleManualSubmit = (e: any) => {
    e.preventDefault();
    if (!merchantName.trim() || !totalAmount || parseFloat(totalAmount) <= 0 || !category) {
      toast("Validation Error", { description: "Please fill all required fields correctly." });
      return;
    }
    manualFormMutation.mutate({
      merchantName: merchantName.trim(),
      totalAmount: parseFloat(totalAmount),
      category: category,
      purchaseDate: purchaseDate || new Date(),
    });
  };

  const handleFileSubmit = (e: any) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("bill", file);
    fileSubmitMutation.mutate(formData);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto p-4 sm:p-6 min-h-screen gap-6">
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        <div className="text-center py-6">
          <h1 className="text-3xl sm:text-4xl font-bold">Xpenza: AI-Powered Expense Management</h1>
          <p className="text-gray-600 mt-4 text-base sm:text-lg">
            Xpenza uses AI to extract text from images, categorize bills, and track your spending.
            Upload a bill image and let Xpenza do the magic.
          </p>
        </div>
  
        <Card className="p-4 sm:p-6">
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Form</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>
  
            <TabsContent value="manual">
              <CardContent className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                <Input type="text" placeholder="Merchant Name" className="h-12" value={merchantName} onChange={(e) => setMerchantName(e.target.value)} />
                <Input type="number" placeholder="Total Amount" className="h-12" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
  
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 text-left">
                      {purchaseDate ? format(purchaseDate, "PPP") : "Select Purchase Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar mode="single" selected={purchaseDate} onSelect={setPurchaseDate} initialFocus />
                  </PopoverContent>
                </Popover>
  
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHOPPING">Shopping</SelectItem>
                    <SelectItem value="FOOD">Food</SelectItem>
                    <SelectItem value="GROCERY">Groceries</SelectItem>
                    <SelectItem value="TRANSPORT">Transport</SelectItem>
                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                    <SelectItem value="UTILITIES">Utilities</SelectItem>
                    <SelectItem value="OTHER">Others</SelectItem>
                  </SelectContent>
                </Select>
  
                {preview && file && (
                  <Card className="w-full border border-gray-200 shadow-sm">
                    <CardContent className="flex items-center gap-4 py-4">
                      <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-semibold">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB • {file.type}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
  
                <Button className="w-full h-12 text-lg" onClick={handleManualSubmit} disabled={manualFormMutation.isPending}>
                  {manualFormMutation.isPending ? <Loader2 className="animate-spin" /> : "Submit"}
                </Button>
              </CardContent>
            </TabsContent>
  
            <TabsContent value="file">
              <CardContent className="flex flex-col items-center gap-4 sm:gap-6 py-4 sm:py-6">
                <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 text-center px-4">
                  <Upload className="w-10 h-10 text-gray-500" />
                  <span className="text-base sm:text-lg text-gray-600">Click or Drag to Upload</span>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} multiple />
                </label>
  
                {preview && file && (
                  <Card className="w-full border border-gray-200 shadow-sm">
                    <CardContent className="flex items-center gap-4 py-4">
                      <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                      <div className="flex-1 space-y-1">
                        <div className="text-sm font-semibold">{file.name}</div>
                        <div className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB • {file.type}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
  
                <Button className="w-full h-12 text-lg" disabled={!file || fileSubmitMutation.isPending} onClick={handleFileSubmit}>
                  {fileSubmitMutation.isPending ? <Loader2 className="animate-spin" /> : "Upload"}
                </Button>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
  
        <RecentUploads />
      </div>
  
      <div className="w-full lg:w-1/2">
        <Instructions />
      </div>
    </div>
  );
  
  
}
