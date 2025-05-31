import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Upload } from "lucide-react";

export default function Instructions() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 sm:px-0 space-y-6">
      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Upload className="w-6 h-6 text-blue-500" /> File Upload Instructions
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="w-full flex justify-center">
            <img
              src="/instruction.png"
              alt="Upload Example"
              className="max-h-52 w-auto rounded-md shadow-md object-contain"
            />
          </div>
          <ul className="list-disc list-inside space-y-3 text-gray-700 text-sm">
            <li>
              Upload a <Badge variant="outline">high-quality</Badge> image.
            </li>
            <li>
              Ensure the image is <Badge variant="outline">clear and readable</Badge>.
            </li>
            <li>
              <Clock className="inline-block w-4 h-4 mr-1 text-yellow-500" />
              Processing may take up to <Badge variant="outline">20 seconds</Badge>.
            </li>
          </ul>
        </CardContent>
      </Card>
  
      <Card className="shadow-lg border border-gray-200 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="w-6 h-6 text-green-500" /> Manual Entry Instructions
          </CardTitle>
          <Separator />
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="list-disc list-inside space-y-3 text-gray-700 text-sm">
            <li>
              Enter the <Badge variant="outline">merchant name</Badge>.
            </li>
            <li>
              Provide the <Badge variant="outline">total amount</Badge>.
            </li>
            <li>Select a category from the list.</li>
            <li>
              Processing is much <Badge variant="outline">faster</Badge> than file upload.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
  
  
}