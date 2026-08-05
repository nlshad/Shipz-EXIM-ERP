export type Currency = 'USD' | 'INR' | 'EUR';

export interface CurrencyRate {
  USD: number;
  INR: number;
  EUR: number;
}

export type DocumentType =
  | 'PI'
  | 'Contract'
  | 'CI'
  | 'PackingList'
  | 'BLDraft'
  | 'PO'
  | 'VGM'
  | 'SCOMET'
  | 'Fumigation'
  | 'NonDG'
  | 'Allergen'
  | 'COA'
  | 'NonGMO'
  | 'NonETO'
  | 'PesticideResidue'
  | 'ProducerDeclaration'
  | 'ShipmentAdvice'
  | 'BillOfExchange'
  | 'DrawbackDeclaration';

export interface DocumentLineItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  grossWeightKg: number;
  netWeightKg: number;
  productImage?: string;
  specification?: string;
  lotNo?: string;
}

export interface EXIMDocument {
  id: string;
  docType: DocumentType;
  documentNumber: string;
  date: string;
  exporterName: string;
  exporterAddress: string;
  exporterIec: string;
  exporterGstin: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCountry: string;
  notifyParty?: string;
  preCarriageBy?: string;
  placeOfReceipt?: string;
  countryOfOrigin?: string;
  countryOfFinalDestination?: string;
  incoterm: 'FOB' | 'CIF' | 'CFR' | 'DDP' | 'EXW';
  portOfLoading: string;
  portOfDischarge: string;
  vesselFlight: string;
  voyageNo?: string;
  containerNumber: string;
  sealNumber?: string;
  lotNumber?: string;
  paymentTerms: string;
  bankName: string;
  bankAdCode: string;
  bankSwift: string;
  lineItems: DocumentLineItem[];
  subtotal: number;
  freightInsuranceCost: number;
  grandTotal: number;
  irnNumber?: string;
  qrCodeGenerated?: boolean;
  status: 'Draft' | 'Issued' | 'Sent' | 'Approved';
  remarks?: string;
  freeDetentionPeriodDays?: number;
}

export type IncentiveScheme = 'RoDTEP' | 'DutyDrawback' | 'RoSCTL';
export type IncentiveStatus = 'To Be Claimed' | 'Claimed' | 'Transfer' | 'Utilize' | 'Realisation' | 'Cancelled' | 'Disputed' | 'Realised';

export interface IncentiveRecord {
  id: string;
  invoiceNo: string;
  shippingBillNo: string;
  shippingBillDate: string;
  hsnCode: string;
  productDescription: string;
  fobValueInr: number;
  scheme: IncentiveScheme;
  ratePercentage: number;
  maxCapPerKgInr?: number;
  calculatedIncentiveInr: number;
  status: IncentiveStatus;
  claimDate?: string;
  realisedDate?: string;
  ebrcNo?: string;
}

export interface ExpenseRecord {
  id: string;
  invoiceNo: string;
  piNo: string;
  consignee: string;
  expenseCategory: 'Freight' | 'CHA Clearance' | 'Fumigation' | 'CFS Handling' | 'Documentation' | 'Insurance';
  expenseAmountInr: number;
  vendorName: string;
  date: string;
}

export interface ProductMaster {
  id: string;
  productName: string;
  hsnCode: string;
  category: string;
  defaultUnit: string;
  applicableScheme: IncentiveScheme;
  incentiveRatePercent: number;
  maxCapPerKgInr: number;
  netWeightKg: number;
  grossWeightKg: number;
  qualitySpecs: string;
}

export type ShipmentStage = 'Container Booked' | 'CFS Reached' | 'Container Stuffed' | 'In Transit' | 'Delivered';

export interface PackagingSpec {
  packageType: 'Jute Bags' | 'Corrugated Boxes' | 'PP Bags' | 'Wooden Crates' | 'Drums';
  totalPackages: number;
  unitsPerPackage: number;
  grossWeightKg: number;
  netWeightKg: number;
  tareWeightKg: number;
  moistureLossPercentage: number;
  qcPassed: boolean;
  grnNumber: string;
}

export interface ShipmentItem {
  id: string;
  piNumber: string;
  invoiceNumber: string;
  containerNumber: string;
  sealNumber: string;
  vesselName: string;
  voyageNo: string;
  shippingLine: string;
  loadingPort: string;
  destinationPort: string;
  destinationCountry: string;
  buyerName: string;
  loadingDueDate: string;
  sailDate?: string;
  etaDate?: string;
  stage: ShipmentStage;
  packagingSpec: PackagingSpec;
  notes?: string;
  stuffingPhotos: string[];
  cfsStatus?: 'Reached' | 'Pending' | 'Unloaded';
}

export interface ContractProfitability {
  contractNo: string;
  buyerName: string;
  fobRevenueUsd: number;
  productionCostUsd: number;
  logisticsFreightUsd: number;
  incentivesRealisedUsd: number;
  netProfitUsd: number;
  marginPercentage: number;
}

export interface DriveAsset {
  id: string;
  title: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'excel';
  category: 'Stuffing Photo' | 'Gate Pass' | 'Compliance PDF' | 'Invoice Export' | 'BL Draft' | 'Quality Cert';
  associatedPiNo: string;
  associatedContainerNo: string;
  uploadDate: string;
  fileSizeMb: number;
  thumbnailUrl: string;
}

export interface OperationalActivity {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'compliance' | 'shipment' | 'document' | 'ebrc' | 'expense';
  user: string;
}
