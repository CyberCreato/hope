import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Save, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Job, User } from "@shared/types";

interface NoncomplianceFormData {
  id: string;
  jobId: string;
  
  // Basic Information
  date: string;
  insuranceName: string;
  claimNumber: string;
  clientName: string;
  clientSurname: string;
  propertyAddress: string;
  contactNumber: string;
  staffName: string;
  staffSignature: string;
  
  // Geyser Information
  geyserMake: string;
  geyserModel: string;
  geyserCapacity: string;
  serial: string;
  code: string;
  installationDate: string;
  warrantyPeriod: string;
  geyserAge: string;
  geyserLocation: string;
  
  // System Information
  waterPressure: string;
  systemType: "balanced" | "unbalanced" | "unknown";
  electricalConnection: string;
  isolatorSwitch: boolean;
  earthing: boolean;
  
  // Compliance Assessment (33 questions)
  complianceIssues: {
    [key: number]: {
      selected: boolean;
      severity: "critical" | "moderate" | "minor";
      notes: string;
      photosRequired: boolean;
    };
  };
  
  // Additional Assessment Fields
  overallCompliance: "compliant" | "non-compliant" | "partial";
  riskLevel: "low" | "medium" | "high";
  urgentAction: boolean;
  quotationRequired: boolean;
  quotationAvailable: "YES" | "NO" | "PENDING" | "";
  
  // Plumber Assessment
  plumberIndemnity:
    | "Electric geyser"
    | "Solar geyser"
    | "Heat pump"
    | "Pipe Repairs"
    | "Assessment"
    | "";
  workRequired: string;
  estimatedCost: number;
  timeRequired: string;
  
  // Additional Information
  accessRequirements: string;
  safetyHazards: string;
  clientInformed: boolean;
  clientSignature: string;
  followUpRequired: boolean;
  followUpDate: string;
  additionalComments: string;
  
  // Technical Details
  pipeMaterial: string;
  pipeSize: string;
  laggingCondition: string;
  supportStructure: string;
  drainageSystem: string;
}

// All 33 compliance questions
const NONCOMPLIANCE_ISSUES = [
  "Cold vacuum breaker (Must be 300mm above geyser)",
  "Hot vacuum breaker (Must be 300mm above geyser and 430mm away)",
  "Vacuum breaker not over drip tray",
  "Safety valve not functioning properly",
  "Pipes not copper - incorrect material used",
  "Geyser brackets missing or inadequate",
  "90 degree short radius bend installed",
  "Pipe run exceeds 4m without upsizing to 28mm",
  "Missing 1m copper from hot water outlet",
  "Missing 1m copper from cold water inlet",
  "Pipes in roof not secured properly",
  "PRV overflow pipe not adequately secured",
  "PRV not positioned over drip tray",
  "System unbalanced - pressure issues",
  "No shut off valve to the geyser",
  "No electrical isolator switch installed",
  "Pipes not electrically bonded correctly",
  "Non return valve missing on unbalanced system",
  "Tray overflow not compliant with regulations",
  "Overflow pipe not PVC material",
  "Missing brackets every 1m on overflow pipe",
  "90 degree short radius bend on overflow",
  "No fall on the overflow outlet pipe",
  "Inadequate geyser support structure",
  "No lagging on hot water pipes",
  "Lagging is split or damaged",
  "Incorrect type of lagging material",
  "Inadequate geyser access for maintenance",
  "Roof sheets/tiles obstruct geyser replacement",
  "Trap door located in bathroom (non-compliant)",
  "Trap door requires enlargement for access",
  "Incorrect pipe type in ceiling (not copper)",
  "Exposed pipes not properly secured or lagged"
];

const ISSUE_CATEGORIES = {
  "Vacuum Breakers": [0, 1, 2],
  "Safety Systems": [3, 12, 14, 15],
  "Pipe Materials & Installation": [4, 5, 6, 7, 8, 9, 10, 31, 32],
  "Overflow & Drainage": [11, 18, 19, 20, 21, 22],
  "System Balance": [13, 17],
  "Electrical": [15, 16],
  "Insulation & Lagging": [23, 24, 25, 26],
  "Access & Maintenance": [27, 28, 29, 30]
};

interface NoncomplianceFormProps {
  job: Job;
  assignedStaff: User | null;
  onSubmit: (formData: NoncomplianceFormData) => void;
  existingData?: NoncomplianceFormData;
}

export function NoncomplianceForm({
  job,
  assignedStaff,
  onSubmit,
  existingData,
}: NoncomplianceFormProps) {
  const [formData, setFormData] = useState<NoncomplianceFormData>(() => ({
    id: existingData?.id || `noncompliance-${Date.now()}`,
    jobId: job.id,
    
    // Basic Information
    date: existingData?.date || new Date().toISOString().split("T")[0],
    insuranceName: existingData?.insuranceName || job.underwriter || job.Underwriter || "",
    claimNumber: existingData?.claimNumber || job.claimNo || job.ClaimNo || "",
    clientName: existingData?.clientName || job.insuredName || job.InsuredName || "",
    clientSurname: existingData?.clientSurname || "",
    propertyAddress: existingData?.propertyAddress || job.riskAddress || "",
    contactNumber: existingData?.contactNumber || "",
    staffName: existingData?.staffName || assignedStaff?.name || "",
    staffSignature: existingData?.staffSignature || "",
    
    // Geyser Information
    geyserMake: existingData?.geyserMake || "",
    geyserModel: existingData?.geyserModel || "",
    geyserCapacity: existingData?.geyserCapacity || "",
    serial: existingData?.serial || "",
    code: existingData?.code || "",
    installationDate: existingData?.installationDate || "",
    warrantyPeriod: existingData?.warrantyPeriod || "",
    geyserAge: existingData?.geyserAge || "",
    geyserLocation: existingData?.geyserLocation || "",
    
    // System Information
    waterPressure: existingData?.waterPressure || "",
    systemType: existingData?.systemType || "unknown",
    electricalConnection: existingData?.electricalConnection || "",
    isolatorSwitch: existingData?.isolatorSwitch || false,
    earthing: existingData?.earthing || false,
    
    // Compliance Issues
    complianceIssues: existingData?.complianceIssues || {},
    
    // Assessment
    overallCompliance: existingData?.overallCompliance || "non-compliant",
    riskLevel: existingData?.riskLevel || "medium",
    urgentAction: existingData?.urgentAction || false,
    quotationRequired: existingData?.quotationRequired || false,
    quotationAvailable: existingData?.quotationAvailable || "",
    
    // Plumber Assessment
    plumberIndemnity: existingData?.plumberIndemnity || "",
    workRequired: existingData?.workRequired || "",
    estimatedCost: existingData?.estimatedCost || 0,
    timeRequired: existingData?.timeRequired || "",
    
    // Additional Information
    accessRequirements: existingData?.accessRequirements || "",
    safetyHazards: existingData?.safetyHazards || "",
    clientInformed: existingData?.clientInformed || false,
    clientSignature: existingData?.clientSignature || "",
    followUpRequired: existingData?.followUpRequired || false,
    followUpDate: existingData?.followUpDate || "",
    additionalComments: existingData?.additionalComments || "",
    
    // Technical Details
    pipeMaterial: existingData?.pipeMaterial || "",
    pipeSize: existingData?.pipeSize || "",
    laggingCondition: existingData?.laggingCondition || "",
    supportStructure: existingData?.supportStructure || "",
    drainageSystem: existingData?.drainageSystem || "",
  }));

  const selectedIssues = Object.keys(formData.complianceIssues).filter(
    key => formData.complianceIssues[parseInt(key)]?.selected
  );

  const handleIssueToggle = (issueIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      complianceIssues: {
        ...prev.complianceIssues,
        [issueIndex]: {
          selected: !prev.complianceIssues[issueIndex]?.selected,
          severity: prev.complianceIssues[issueIndex]?.severity || "moderate",
          notes: prev.complianceIssues[issueIndex]?.notes || "",
          photosRequired: prev.complianceIssues[issueIndex]?.photosRequired || false,
        },
      },
    }));
  };

  const updateIssueDetails = (issueIndex: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      complianceIssues: {
        ...prev.complianceIssues,
        [issueIndex]: {
          ...prev.complianceIssues[issueIndex],
          [field]: value,
        },
      },
    }));
  };

  const updateField = (field: keyof NoncomplianceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateCompliance = () => {
    const totalIssues = selectedIssues.length;
    const criticalIssues = selectedIssues.filter(key => 
      formData.complianceIssues[parseInt(key)]?.severity === "critical"
    ).length;

    if (totalIssues === 0) return "compliant";
    if (criticalIssues > 0 || totalIssues > 10) return "non-compliant";
    return "partial";
  };

  const calculateRiskLevel = () => {
    const totalIssues = selectedIssues.length;
    const criticalIssues = selectedIssues.filter(key => 
      formData.complianceIssues[parseInt(key)]?.severity === "critical"
    ).length;

    if (criticalIssues > 0) return "high";
    if (totalIssues > 5) return "medium";
    return "low";
  };

  useEffect(() => {
    const compliance = calculateCompliance();
    const risk = calculateRiskLevel();
    
    setFormData(prev => ({
      ...prev,
      overallCompliance: compliance,
      riskLevel: risk,
      urgentAction: risk === "high",
      quotationRequired: compliance !== "compliant",
    }));
  }, [formData.complianceIssues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(
        `/api/generate-noncompliance-pdf/${formData.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = formData.insuranceName.toLowerCase().includes("discovery") ? "desco.pdf" : "Noncompliance.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "moderate": return "text-orange-600 bg-orange-50 border-orange-200";
      case "minor": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case "compliant": return "text-green-600 bg-green-50";
      case "non-compliant": return "text-red-600 bg-red-50";
      case "partial": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Non-Compliance Assessment Form
              <Badge variant="outline" className="ml-2">
                {job.title}
              </Badge>
            </div>
            <Button onClick={generatePDF} variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Generate PDF
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateField("date", e.target.value)}
                    className="text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Insurance Name</Label>
                  <Input
                    value={formData.insuranceName}
                    onChange={(e) => updateField("insuranceName", e.target.value)}
                    className="text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-green-600">
                    Claim Number *
                  </Label>
                  <Input
                    value={formData.claimNumber}
                    onChange={(e) => updateField("claimNumber", e.target.value)}
                    className="text-sm bg-white"
                    placeholder="Auto-filled from job"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Client Name</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    className="text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Client Surname</Label>
                  <Input
                    value={formData.clientSurname}
                    onChange={(e) => updateField("clientSurname", e.target.value)}
                    className="text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact Number</Label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) => updateField("contactNumber", e.target.value)}
                    className="text-sm bg-white"
                    placeholder="Client contact"
                  />
                </div>
                <div className="col-span-full">
                  <Label className="text-sm font-medium">Property Address</Label>
                  <Input
                    value={formData.propertyAddress}
                    onChange={(e) => updateField("propertyAddress", e.target.value)}
                    className="text-sm bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Staff Name</Label>
                  <Input
                    value={formData.staffName}
                    onChange={(e) => updateField("staffName", e.target.value)}
                    className="text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Geyser Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Geyser Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Geyser Make</Label>
                  <Input
                    value={formData.geyserMake}
                    onChange={(e) => updateField("geyserMake", e.target.value)}
                    placeholder="e.g., Kwikot, Heattech"
                  />
                </div>
                <div>
                  <Label>Geyser Model</Label>
                  <Input
                    value={formData.geyserModel}
                    onChange={(e) => updateField("geyserModel", e.target.value)}
                    placeholder="Model number"
                  />
                </div>
                <div>
                  <Label>Capacity (Litres)</Label>
                  <Input
                    value={formData.geyserCapacity}
                    onChange={(e) => updateField("geyserCapacity", e.target.value)}
                    placeholder="e.g., 150L"
                  />
                </div>
                <div>
                  <Label>Serial Number</Label>
                  <Input
                    value={formData.serial}
                    onChange={(e) => updateField("serial", e.target.value)}
                    placeholder="Serial number"
                  />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => updateField("code", e.target.value)}
                    placeholder="Product code"
                  />
                </div>
                <div>
                  <Label>Installation Date</Label>
                  <Input
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) => updateField("installationDate", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Warranty Period</Label>
                  <Input
                    value={formData.warrantyPeriod}
                    onChange={(e) => updateField("warrantyPeriod", e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
                <div>
                  <Label>Geyser Age</Label>
                  <Input
                    value={formData.geyserAge}
                    onChange={(e) => updateField("geyserAge", e.target.value)}
                    placeholder="Years in service"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.geyserLocation}
                    onChange={(e) => updateField("geyserLocation", e.target.value)}
                    placeholder="e.g., Roof space, bathroom"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* System Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">System Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Water Pressure</Label>
                  <Input
                    value={formData.waterPressure}
                    onChange={(e) => updateField("waterPressure", e.target.value)}
                    placeholder="e.g., 300kPa"
                  />
                </div>
                <div>
                  <Label>System Type</Label>
                  <Select
                    value={formData.systemType}
                    onValueChange={(value: any) => updateField("systemType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="unbalanced">Unbalanced</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Electrical Connection</Label>
                  <Input
                    value={formData.electricalConnection}
                    onChange={(e) => updateField("electricalConnection", e.target.value)}
                    placeholder="Connection type"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.isolatorSwitch}
                    onCheckedChange={(checked) => updateField("isolatorSwitch", checked)}
                  />
                  <Label>Isolator Switch Present</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.earthing}
                    onCheckedChange={(checked) => updateField("earthing", checked)}
                  />
                  <Label>Proper Earthing</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Pipe Material</Label>
                  <Input
                    value={formData.pipeMaterial}
                    onChange={(e) => updateField("pipeMaterial", e.target.value)}
                    placeholder="e.g., Copper, CPVC"
                  />
                </div>
                <div>
                  <Label>Pipe Size</Label>
                  <Input
                    value={formData.pipeSize}
                    onChange={(e) => updateField("pipeSize", e.target.value)}
                    placeholder="e.g., 22mm, 28mm"
                  />
                </div>
                <div>
                  <Label>Lagging Condition</Label>
                  <Input
                    value={formData.laggingCondition}
                    onChange={(e) => updateField("laggingCondition", e.target.value)}
                    placeholder="Good, Poor, Missing"
                  />
                </div>
                <div>
                  <Label>Support Structure</Label>
                  <Input
                    value={formData.supportStructure}
                    onChange={(e) => updateField("supportStructure", e.target.value)}
                    placeholder="Adequacy of supports"
                  />
                </div>
                <div>
                  <Label>Drainage System</Label>
                  <Input
                    value={formData.drainageSystem}
                    onChange={(e) => updateField("drainageSystem", e.target.value)}
                    placeholder="Overflow system condition"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Compliance Issues - 33 Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Non-compliance Issues Assessment (33 Points)</h3>
                <Badge variant="outline" className={getComplianceColor(formData.overallCompliance)}>
                  {selectedIssues.length} issues selected
                </Badge>
              </div>

              {Object.entries(ISSUE_CATEGORIES).map(([category, indices]) => (
                <Card key={category} className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {indices.map((index) => {
                        const issue = NONCOMPLIANCE_ISSUES[index];
                        const issueData = formData.complianceIssues[index];
                        const isSelected = issueData?.selected || false;
                        
                        return (
                          <div
                            key={index}
                            className={`border rounded-lg p-4 ${
                              isSelected ? getSeverityColor(issueData?.severity || "moderate") : "bg-gray-50"
                            }`}
                          >
                            <div
                              className="flex items-start space-x-3 cursor-pointer"
                              onClick={() => handleIssueToggle(index)}
                            >
                              <div className="flex-shrink-0 mt-1">
                                {isSelected ? (
                                  <CheckCircle className="h-5 w-5 text-red-600" />
                                ) : (
                                  <div className="h-5 w-5 border-2 border-gray-300 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <span className="text-sm font-medium mr-2">
                                      {index + 1}.
                                    </span>
                                    <span className="text-sm">{issue}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="mt-4 space-y-3 pl-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Severity Level</Label>
                                    <Select
                                      value={issueData?.severity || "moderate"}
                                      onValueChange={(value: any) => updateIssueDetails(index, "severity", value)}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="minor">Minor</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      checked={issueData?.photosRequired || false}
                                      onCheckedChange={(checked) => updateIssueDetails(index, "photosRequired", checked)}
                                    />
                                    <Label className="text-xs">Photos Required</Label>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs">Additional Notes</Label>
                                  <Textarea
                                    value={issueData?.notes || ""}
                                    onChange={(e) => updateIssueDetails(index, "notes", e.target.value)}
                                    placeholder="Detailed notes about this issue..."
                                    rows={2}
                                    className="text-xs"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Assessment Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Assessment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label>Overall Compliance</Label>
                  <Select
                    value={formData.overallCompliance}
                    onValueChange={(value: any) => updateField("overallCompliance", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compliant">Compliant</SelectItem>
                      <SelectItem value="partial">Partially Compliant</SelectItem>
                      <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Risk Level</Label>
                  <Select
                    value={formData.riskLevel}
                    onValueChange={(value: any) => updateField("riskLevel", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.urgentAction}
                    onCheckedChange={(checked) => updateField("urgentAction", checked)}
                  />
                  <Label>Urgent Action Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.quotationRequired}
                    onCheckedChange={(checked) => updateField("quotationRequired", checked)}
                  />
                  <Label>Quotation Required</Label>
                </div>
              </div>
            </div>

            {/* Plumber Assessment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Plumber Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Plumber Indemnity</Label>
                  <Select
                    value={formData.plumberIndemnity}
                    onValueChange={(value: any) => updateField("plumberIndemnity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select indemnity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electric geyser">Electric geyser</SelectItem>
                      <SelectItem value="Solar geyser">Solar geyser</SelectItem>
                      <SelectItem value="Heat pump">Heat pump</SelectItem>
                      <SelectItem value="Pipe Repairs">Pipe Repairs</SelectItem>
                      <SelectItem value="Assessment">Assessment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estimated Cost (R)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={(e) => updateField("estimatedCost", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-full">
                  <Label>Work Required</Label>
                  <Textarea
                    value={formData.workRequired}
                    onChange={(e) => updateField("workRequired", e.target.value)}
                    placeholder="Describe the work required to achieve compliance..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Time Required</Label>
                  <Input
                    value={formData.timeRequired}
                    onChange={(e) => updateField("timeRequired", e.target.value)}
                    placeholder="e.g., 4-6 hours"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div>
                  <Label>Access Requirements</Label>
                  <Textarea
                    value={formData.accessRequirements}
                    onChange={(e) => updateField("accessRequirements", e.target.value)}
                    placeholder="Special access requirements for repair work..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Safety Hazards Identified</Label>
                  <Textarea
                    value={formData.safetyHazards}
                    onChange={(e) => updateField("safetyHazards", e.target.value)}
                    placeholder="Any safety hazards or concerns..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Additional Comments</Label>
                  <Textarea
                    value={formData.additionalComments}
                    onChange={(e) => updateField("additionalComments", e.target.value)}
                    placeholder="Any additional comments or observations..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.clientInformed}
                      onCheckedChange={(checked) => updateField("clientInformed", checked)}
                    />
                    <Label>Client Informed of Issues</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.followUpRequired}
                      onCheckedChange={(checked) => updateField("followUpRequired", checked)}
                    />
                    <Label>Follow-up Required</Label>
                  </div>
                </div>
                {formData.followUpRequired && (
                  <div>
                    <Label>Follow-up Date</Label>
                    <Input
                      type="date"
                      value={formData.followUpDate}
                      onChange={(e) => updateField("followUpDate", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Quotation Section */}
            <div>
              <Label className="text-lg font-semibold">
                Can a quotation be supplied to meet these critical compliance requirements?
              </Label>
              <Select
                value={formData.quotationAvailable}
                onValueChange={(value: any) => updateField("quotationAvailable", value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select YES, NO, or PENDING" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YES">YES</SelectItem>
                  <SelectItem value="NO">NO</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                type="button"
                onClick={generatePDF}
                variant="outline"
                className="flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate PDF
              </Button>
              <div className="flex space-x-4">
                <Button type="button" variant="outline">
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  disabled={selectedIssues.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Submit Assessment
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Assessment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {selectedIssues.length}
            </div>
            <div className="text-sm text-red-800">Issues Identified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {selectedIssues.filter(key => formData.complianceIssues[parseInt(key)]?.severity === "critical").length}
            </div>
            <div className="text-sm text-orange-800">Critical Issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {33 - selectedIssues.length}
            </div>
            <div className="text-sm text-blue-800">Compliant Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(((33 - selectedIssues.length) / 33) * 100)}%
            </div>
            <div className="text-sm text-green-800">Compliance Rate</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
