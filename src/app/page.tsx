'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Header } from '@/components/header';
import ExcelUploader from '@/components/excel-uploader';
import TablePreview from '@/components/table-preview';
import SqlOutput from '@/components/sql-output';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowDown, Maximize } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

type Row = Record<string, string | number | null | undefined>;

export default function Home() {
  const [data, setData] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [sql, setSql] = useState('');
  const [tableName, setTableName] = useState('my_table');
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBatchInsert, setIsBatchInsert] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (file: File) => {
    setLoading(true);
    setData([]);
    setHeaders([]);
    setSql('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result;
        if (!fileData) {
          throw new Error("Failed to read file");
        }
        const workbook = XLSX.read(fileData, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (!jsonData || jsonData.length < 2) {
            throw new Error("Excel sheet must have a header row and at least one data row.");
        }
        
        const fileHeaders = jsonData[0].map(header => String(header).trim()).filter(h => h);
        if (fileHeaders.length === 0) {
            throw new Error("Could not find a valid header row.");
        }

        const fileDataRows = jsonData.slice(1)
          .filter(row => row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== ''))
          .map(row => {
            const rowData: Row = {};
            fileHeaders.forEach((header, index) => {
              rowData[header] = row[index] !== undefined ? row[index] : null;
            });
            return rowData;
          });

        if (fileDataRows.length === 0) {
          throw new Error("No data rows with content found in the file.");
        }

        setHeaders(fileHeaders);
        setData(fileDataRows);
        toast({
            title: "File processed successfully!",
            description: `Found ${fileDataRows.length} rows with data. You can now preview the data.`,
        });

      } catch (err) {
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Error processing file",
            description: message,
        });
        setFileName(null);
        setData([]);
        setHeaders([]);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "An error occurred while trying to read the file.",
        });
        setLoading(false);
        setFileName(null);
    }
    reader.readAsArrayBuffer(file);
  };

  const generateSql = () => {
    if (data.length === 0 || headers.length === 0) {
        toast({
            variant: "destructive",
            title: "No data to convert",
            description: "Please upload a file with data first.",
        });
        return;
    };

    if (!tableName.trim()) {
        toast({
            variant: "destructive",
            title: "Table Name Required",
            description: "Please enter a name for your SQL table.",
        });
        return;
    }

    const columns = headers.map(h => `\`${h.trim()}\``).join(', ');
    const formatValue = (value: any) => {
        if (value === null || value === undefined || String(value).trim() === '') {
            return 'NULL';
        }
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`;
        }
        return value;
    };
    
    let generatedSql = '';

    if (isBatchInsert) {
        const valuesList = data.map(row => {
            const rowValues = headers.map(header => formatValue(row[header])).join(', ');
            return `(${rowValues})`;
        }).join(',\n    ');
        generatedSql = `INSERT INTO \`${tableName.trim()}\` (${columns}) VALUES\n    ${valuesList};`;
    } else {
        generatedSql = data.map(row => {
            const values = headers.map(header => formatValue(row[header])).join(', ');
            return `INSERT INTO \`${tableName.trim()}\` (${columns}) VALUES (${values});`;
        }).join('\n');
    }

    setSql(generatedSql);
    toast({
        title: "SQL Generated!",
        description: "Your INSERT statements are ready below."
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">1</span>
                Upload Excel File
              </CardTitle>
              <CardDescription>Select or drop an .xlsx file to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelUploader onFileUpload={handleFileUpload} loading={loading} fileName={fileName} />
            </CardContent>
          </Card>

          {data.length > 0 && (
            <>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold flex items-center gap-3">
                     <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">2</span>
                     Preview & Configure
                  </CardTitle>
                  <CardDescription>Review your data, set the SQL table name, and generate the code.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="tableName" className="font-semibold">Table Name</Label>
                            <Input
                            id="tableName"
                            type="text"
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            placeholder="e.g., users"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="batch-insert" checked={isBatchInsert} onCheckedChange={(checked) => setIsBatchInsert(checked as boolean)} />
                            <label
                                htmlFor="batch-insert"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Batch Insert
                            </label>
                        </div>
                    </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium">Data Preview:</p>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Maximize className="mr-2 h-4 w-4" />
                                    Maximize
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Maximized Data Preview</DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 min-h-0">
                                  <TablePreview headers={headers} data={data} maximized />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <TablePreview headers={headers} data={data} />
                  </div>
                  <div className="flex justify-center pt-4">
                     <Button onClick={generateSql} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <ArrowDown className="mr-2 h-5 w-5" /> Generate SQL
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {sql && (
                 <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-lg">3</span>
                            Get Your SQL Code
                        </CardTitle>
                        <CardDescription>Copy the generated INSERT statements or download as a .sql file.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SqlOutput sql={sql} tableName={tableName} />
                    </CardContent>
                 </Card>
              )}
            </>
          )}
        </div>
      </main>
      <footer className="py-6 mt-8">
          <div className="container mx-auto text-center text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} SQL Sheet. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
