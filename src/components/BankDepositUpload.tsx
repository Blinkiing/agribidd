import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Check, AlertCircle, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet } from "@/context/WalletContext";

interface BankDepositUploadProps {
  amount: number;
  userId: string;
  onSuccess: (reference: string, screenshotUrl: string) => void;
  onError?: () => void;
  isLoading?: boolean;
}

// Mock bank details - replace with actual bank details
const BANK_DETAILS = {
  bankName: "Standard Bank",
  accountName: "Farm Fresh Connect",
  accountNumber: "9876543210",
  branchCode: "051001",
  accountType: "Business Cheque",
  reference: "", // Will be generated per transaction
};

export const BankDepositUpload = ({
  amount,
  userId,
  onSuccess,
  onError,
  isLoading = false,
}: BankDepositUploadProps) => {
  const { addBankDeposit } = useWallet();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(true);
  const [uploadedSuccessfully, setUploadedSuccessfully] = useState(false);
  const reference = `DEP-${userId}-${Date.now()}`;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setScreenshot(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!screenshot) {
      toast.error("Please select a screenshot to upload");
      return;
    }

    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setIsUploading(true);

    try {
      // In production, upload to a storage service (Firebase, S3, Supabase storage, etc.)
      // For now, simulating cloud upload
      const formData = new FormData();
      formData.append("file", screenshot);
      formData.append("amount", amount.toString());
      formData.append("userId", userId);
      formData.append("reference", reference);

      // Simulate API call - replace with actual upload endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate successful upload with a mock URL
      const screenshotUrl = preview || `uploaded-${Date.now()}`;

      // Add bank deposit to transaction history with pending status
      addBankDeposit(amount, reference, screenshotUrl);

      setUploadedSuccessfully(true);
      toast.success("Screenshot uploaded successfully!");

      // Call success callback
      setTimeout(() => {
        onSuccess(reference, screenshotUrl);
      }, 1500);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload screenshot");
      onError?.();
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  if (uploadedSuccessfully) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <Check className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="font-semibold text-green-900 mb-2">Deposit Pending Review</h3>
        <p className="text-sm text-green-800 mb-4">
          Your deposit of <span className="font-bold">{amount.toFixed(2)} ZAR</span> has been submitted
        </p>
        <p className="text-xs text-green-700">
          Reference: <span className="font-mono font-bold">{reference}</span>
        </p>
        <p className="text-xs text-green-700 mt-2">
          Your wallet will be credited within 2-4 business hours after verification
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 py-4">
      {/* Bank Details Section */}
      {showBankDetails && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-blue-900">Bank Details</h3>
            <button
              onClick={() => setShowBankDetails(false)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Hide
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-800">Bank Name:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-900">{BANK_DETAILS.bankName}</span>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.bankName)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-800">Account Name:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-900">
                  {BANK_DETAILS.accountName}
                </span>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.accountName)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-800">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-900">
                  {BANK_DETAILS.accountNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.accountNumber)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-blue-200">
              <span className="text-blue-800">Branch Code:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-900">
                  {BANK_DETAILS.branchCode}
                </span>
                <button
                  onClick={() => copyToClipboard(BANK_DETAILS.branchCode)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-blue-800">Amount:</span>
              <span className="font-mono font-bold text-blue-900">{amount.toFixed(2)} ZAR</span>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-blue-200 mt-2">
              <span className="text-blue-800">Reference:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-900 text-xs">{reference}</span>
                <button
                  onClick={() => copyToClipboard(reference)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-300">
            <p className="text-xs text-blue-900">
              <strong>Important:</strong> Include the reference number in your transfer for auto-verification
            </p>
          </div>
        </div>
      )}

      {/* Amount Display (Auto-filled) */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Deposit Amount (Auto-filled)</p>
        <p className="text-2xl font-bold text-gray-900">{amount.toFixed(2)} ZAR</p>
      </div>

      {/* User ID Display (Auto-filled) */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Your User ID (Auto-filled)</p>
        <div className="flex items-center justify-between">
          <p className="font-mono font-semibold text-gray-900">{userId}</p>
          <button
            onClick={() => copyToClipboard(userId)}
            className="text-gray-600 hover:text-gray-800"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Screenshot Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Payment Proof (Screenshot)</label>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            preview
              ? "border-green-400 bg-green-50"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100"
          )}
        >
          {preview ? (
            <div className="space-y-3">
              <img
                src={preview}
                alt="Receipt preview"
                className="max-h-48 mx-auto rounded-lg"
              />
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <span className="text-sm text-blue-600 hover:text-blue-800">
                  Click to change image
                </span>
              </label>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <div className="space-y-2">
                <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG, or GIF (max 5MB)</p>
                </div>
              </div>
            </label>
          )}
        </div>
        {screenshot && (
          <p className="text-xs text-green-600">✓ {screenshot.name} selected</p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900">
          <p className="font-semibold mb-1">Instructions:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Deposit the exact amount to the bank account above</li>
            <li>Include the reference number in your payment</li>
            <li>Take a screenshot of the successful transfer</li>
            <li>Upload the screenshot below</li>
          </ol>
        </div>
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={isLoading || isUploading || !screenshot || amount <= 0}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? "Uploading..." : `Upload Proof & Add ${amount.toFixed(2)} ZAR`}
      </Button>
    </div>
  );
};

export default BankDepositUpload;
