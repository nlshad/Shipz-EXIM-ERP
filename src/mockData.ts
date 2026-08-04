import { EXIMDocument, IncentiveRecord, ShipmentItem, DriveAsset, ContractProfitability, OperationalActivity, ExpenseRecord, ProductMaster } from './types';

export const INITIAL_DOCUMENTS: EXIMDocument[] = [
  {
    id: 'doc-001',
    docType: 'CI',
    documentNumber: 'EXP/CI/2026/089',
    date: '2026-08-01',
    exporterName: 'Apex EXIM Global Solutions Pvt Ltd',
    exporterAddress: 'Industrial Zone 4, Plot 108, Mundra Port Special Economic Zone, Gujarat - 370421, India',
    exporterIec: '0304891204',
    exporterGstin: '24AAACA1089A1Z3',
    consigneeName: 'Hamburg Trade Logistics GmbH',
    consigneeAddress: 'Speicherstadt Hafen 12, 20457 Hamburg, Germany',
    consigneeCountry: 'Germany',
    notifyParty: 'Same as Consignee / Hamburg Port Agent',
    preCarriageBy: 'BY SEA',
    placeOfReceipt: 'MUNDRA SEZ ICD',
    countryOfOrigin: 'INDIA',
    countryOfFinalDestination: 'GERMANY',
    incoterm: 'FOB',
    portOfLoading: 'Mundra Port (INMUN1)',
    portOfDischarge: 'Hamburg Port (DEHAM)',
    vesselFlight: 'Maersk Sealand / V.2409W',
    voyageNo: 'V.2409W',
    containerNumber: 'MSKU-882190-4',
    sealNumber: 'SL-MDR-9921',
    lotNumber: 'LOT-RING-30S-01',
    paymentTerms: '30% Advance + 70% Irrevocable LC at Sight',
    bankName: 'State Bank of India (Overseas Branch)',
    bankAdCode: '0400012903',
    bankSwift: 'SBININBB102',
    freeDetentionPeriodDays: 14,
    lineItems: [
      {
        id: 'li-1',
        description: 'Organic Processed Cotton Yarn (Ring Spun 30s Count)',
        hsnCode: '52051210',
        quantity: 24000,
        unit: 'KG',
        unitPrice: 4.25,
        totalAmount: 102000,
        grossWeightKg: 25200,
        netWeightKg: 24000,
        specification: 'Count: 30s, CSP: 2400+, Moisture: 7.5%'
      },
      {
        id: 'li-2',
        description: 'Woven Cotton Fabric Rolls (Grey Unbleached)',
        hsnCode: '52081110',
        quantity: 15000,
        unit: 'MTRS',
        unitPrice: 2.10,
        totalAmount: 31500,
        grossWeightKg: 7800,
        netWeightKg: 7500,
        specification: 'Width: 63 Inches, GSM: 120'
      }
    ],
    subtotal: 133500,
    freightInsuranceCost: 4500,
    grandTotal: 138000,
    irnNumber: '7c8a912b4e89012c4f56789a0123456789abcdef0123456789abcdef01234567',
    qrCodeGenerated: true,
    status: 'Issued'
  },
  {
    id: 'doc-002',
    docType: 'PI',
    documentNumber: 'EXP/PI/2026/104',
    date: '2026-08-02',
    exporterName: 'Apex EXIM Global Solutions Pvt Ltd',
    exporterAddress: 'Industrial Zone 4, Plot 108, Mundra Port Special Economic Zone, Gujarat - 370421, India',
    exporterIec: '0304891204',
    exporterGstin: '24AAACA1089A1Z3',
    consigneeName: 'Rotterdam Spice & Agri Importers B.V.',
    consigneeAddress: 'Maasvlakte Boulevard 40, 3000 ED Rotterdam, Netherlands',
    consigneeCountry: 'Netherlands',
    notifyParty: 'Rotterdam Customs Broker B.V.',
    preCarriageBy: 'BY SEA',
    placeOfReceipt: 'JNPT ICD',
    countryOfOrigin: 'INDIA',
    countryOfFinalDestination: 'NETHERLANDS',
    incoterm: 'CIF',
    portOfLoading: 'Nhava Sheva (INNSA1)',
    portOfDischarge: 'Rotterdam (NLRTM)',
    vesselFlight: 'MSC Geneva / V.910E',
    voyageNo: 'V.910E',
    containerNumber: 'MEDU-901244-1',
    paymentTerms: '100% Wire Transfer Against BL Copy',
    bankName: 'HDFC Bank Ltd (International Trade Division)',
    bankAdCode: '0510009822',
    bankSwift: 'HDFCINBB',
    lineItems: [
      {
        id: 'li-3',
        description: 'Premium Whole Cumin Seeds (Sortex Cleaned 99.5%)',
        hsnCode: '09093110',
        quantity: 18000,
        unit: 'KG',
        unitPrice: 3.80,
        totalAmount: 68400,
        grossWeightKg: 18600,
        netWeightKg: 18000,
        specification: 'Purity: 99.5%, Moisture: Max 8%'
      }
    ],
    subtotal: 68400,
    freightInsuranceCost: 3200,
    grandTotal: 71600,
    status: 'Draft'
  }
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    invoiceNo: 'INV/4/23-24',
    piNo: 'PI/4/23-24',
    consignee: 'Edoko Importers',
    expenseCategory: 'CHA Clearance',
    expenseAmountInr: 6800.00,
    vendorName: 'RKS Global Export Logistics',
    date: '2026-07-28'
  },
  {
    id: 'exp-2',
    invoiceNo: 'INV/3/23-24',
    piNo: 'PI/3/23-24',
    consignee: 'Hunza Foods Exports',
    expenseCategory: 'Freight',
    expenseAmountInr: 124069.00,
    vendorName: 'Ocean Line Freight Ltd',
    date: '2026-07-25'
  },
  {
    id: 'exp-3',
    invoiceNo: 'INV/9/23-24',
    piNo: 'PI/6/23-24',
    consignee: 'Edoko Importers',
    expenseCategory: 'CFS Handling',
    expenseAmountInr: 32300.00,
    vendorName: 'Mundra SEZ Terminal',
    date: '2026-07-20'
  },
  {
    id: 'exp-4',
    invoiceNo: 'INV/5/23-24',
    piNo: 'PI/5/23-24',
    consignee: 'Edoko Importers',
    expenseCategory: 'Fumigation',
    expenseAmountInr: 51000.00,
    vendorName: 'Agri Pest Control India',
    date: '2026-07-15'
  },
  {
    id: 'exp-5',
    invoiceNo: 'INV/2/23-24',
    piNo: 'PI/2/23-24',
    consignee: 'Hunza Foods Exports',
    expenseCategory: 'Freight',
    expenseAmountInr: 390600.00,
    vendorName: 'Maersk Line India',
    date: '2026-07-10'
  }
];

export const INITIAL_PRODUCT_MASTER: ProductMaster[] = [
  {
    id: 'prod-1',
    productName: 'Organic Processed Cotton Yarn (Ring Spun 30s)',
    hsnCode: '52051210',
    category: 'Textiles & Yarns',
    defaultUnit: 'KG',
    applicableScheme: 'RoDTEP',
    incentiveRatePercent: 3.1,
    maxCapPerKgInr: 4.5,
    netWeightKg: 1.0,
    grossWeightKg: 1.05,
    qualitySpecs: 'Count 30s, CSP 2400+, Zero Foreign Fibers'
  },
  {
    id: 'prod-2',
    productName: 'Woven Cotton Fabric Rolls (Grey Unbleached)',
    hsnCode: '52081110',
    category: 'Textiles & Fabrics',
    defaultUnit: 'MTRS',
    applicableScheme: 'RoSCTL',
    incentiveRatePercent: 4.3,
    maxCapPerKgInr: 6.0,
    netWeightKg: 0.5,
    grossWeightKg: 0.52,
    qualitySpecs: 'Width 63", GSM 120, Grade A Export Quality'
  },
  {
    id: 'prod-3',
    productName: 'Premium Whole Cumin Seeds (Sortex 99.5%)',
    hsnCode: '09093110',
    category: 'Spices & Agri',
    defaultUnit: 'KG',
    applicableScheme: 'RoDTEP',
    incentiveRatePercent: 2.5,
    maxCapPerKgInr: 3.5,
    netWeightKg: 1.0,
    grossWeightKg: 1.03,
    qualitySpecs: 'Sortex Cleaned 99.5%, Moisture Max 8%, Non-GMO'
  },
  {
    id: 'prod-4',
    productName: 'Embedded Controller Sub-Assembly Units',
    hsnCode: '84713010',
    category: 'Electronics & Machinery',
    defaultUnit: 'PCS',
    applicableScheme: 'DutyDrawback',
    incentiveRatePercent: 1.8,
    maxCapPerKgInr: 12.0,
    netWeightKg: 2.5,
    grossWeightKg: 2.7,
    qualitySpecs: 'CE Certified, RoHS Compliant, ISO 9001 QC Passed'
  }
];

export const INITIAL_INCENTIVES: IncentiveRecord[] = [
  {
    id: 'inc-101',
    invoiceNo: 'EXP/CI/2026/089',
    shippingBillNo: 'SB-8902145',
    shippingBillDate: '2026-07-28',
    hsnCode: '52051210',
    productDescription: 'Organic Processed Cotton Yarn',
    fobValueInr: 8517000,
    scheme: 'RoDTEP',
    ratePercentage: 3.1,
    maxCapPerKgInr: 4.5,
    calculatedIncentiveInr: 264027,
    status: 'Realised',
    claimDate: '2026-07-30',
    realisedDate: '2026-08-01',
    ebrcNo: 'eBRC-DGFT-2026-904128'
  },
  {
    id: 'inc-102',
    invoiceNo: 'EXP/CI/2026/089',
    shippingBillNo: 'SB-8902145',
    shippingBillDate: '2026-07-28',
    hsnCode: '52081110',
    productDescription: 'Woven Cotton Fabric Rolls',
    fobValueInr: 2628750,
    scheme: 'RoSCTL',
    ratePercentage: 4.3,
    maxCapPerKgInr: 6.0,
    calculatedIncentiveInr: 113036,
    status: 'Claimed',
    claimDate: '2026-07-31'
  },
  {
    id: 'inc-103',
    invoiceNo: 'EXP/CI/2026/072',
    shippingBillNo: 'SB-7749102',
    shippingBillDate: '2026-07-15',
    hsnCode: '09093110',
    productDescription: 'Premium Whole Cumin Seeds',
    fobValueInr: 5711400,
    scheme: 'RoDTEP',
    ratePercentage: 2.5,
    maxCapPerKgInr: 3.5,
    calculatedIncentiveInr: 142785,
    status: 'To Be Claimed'
  },
  {
    id: 'inc-104',
    invoiceNo: 'EXP/CI/2026/065',
    shippingBillNo: 'SB-6601923',
    shippingBillDate: '2026-07-02',
    hsnCode: '84713010',
    productDescription: 'Embedded Controller Sub-Assembly Units',
    fobValueInr: 12450000,
    scheme: 'Duty Drawback',
    ratePercentage: 1.8,
    maxCapPerKgInr: 12.0,
    calculatedIncentiveInr: 224100,
    status: 'Disputed',
    claimDate: '2026-07-10'
  }
];

export const INITIAL_SHIPMENTS: ShipmentItem[] = [
  {
    id: 'ship-1',
    piNumber: 'EXP/PI/2026/104',
    invoiceNumber: 'EXP/CI/2026/089',
    containerNumber: 'MSKU-882190-4',
    sealNumber: 'SL-MDR-9921',
    vesselName: 'Maersk Sealand',
    voyageNo: 'V.2409W',
    shippingLine: 'Maersk Line India',
    loadingPort: 'Mundra Port (INMUN1)',
    destinationPort: 'Hamburg Port (DEHAM)',
    destinationCountry: 'Germany',
    buyerName: 'Hamburg Trade Logistics GmbH',
    loadingDueDate: '2026-08-05',
    sailDate: '2026-08-07',
    etaDate: '2026-08-25',
    stage: 'CFS Reached',
    cfsStatus: 'Reached',
    packagingSpec: {
      packageType: 'PP Bags',
      totalPackages: 960,
      unitsPerPackage: 25,
      grossWeightKg: 25200,
      netWeightKg: 24000,
      tareWeightKg: 1200,
      moistureLossPercentage: 0.4,
      qcPassed: true,
      grnNumber: 'GRN-2026-8809'
    },
    notes: 'CFS inspection completed at Mundra SEZ. Waiting for customs clearance stamp.',
    stuffingPhotos: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    id: 'ship-2',
    piNumber: 'EXP/PI/2026/108',
    invoiceNumber: 'EXP/CI/2026/092',
    containerNumber: 'MEDU-901244-1',
    sealNumber: 'SL-MSC-4410',
    vesselName: 'MSC Geneva',
    voyageNo: 'V.910E',
    shippingLine: 'Mediterranean Shipping Co',
    loadingPort: 'Nhava Sheva (INNSA1)',
    destinationPort: 'Rotterdam (NLRTM)',
    destinationCountry: 'Netherlands',
    buyerName: 'Rotterdam Spice & Agri Importers B.V.',
    loadingDueDate: '2026-08-08',
    sailDate: '2026-08-10',
    etaDate: '2026-08-28',
    stage: 'Container Booked',
    cfsStatus: 'Pending',
    packagingSpec: {
      packageType: 'Jute Bags',
      totalPackages: 720,
      unitsPerPackage: 25,
      grossWeightKg: 18600,
      netWeightKg: 18000,
      tareWeightKg: 600,
      moistureLossPercentage: 0.2,
      qcPassed: true,
      grnNumber: 'GRN-2026-9012'
    },
    notes: 'Container empty pickup scheduled from JNPT ICD terminal.',
    stuffingPhotos: []
  },
  {
    id: 'ship-3',
    piNumber: 'EXP/PI/2026/098',
    invoiceNumber: 'EXP/CI/2026/078',
    containerNumber: 'CMAU-551029-8',
    sealNumber: 'SL-CMA-1109',
    vesselName: 'CMA CGM Liberty',
    voyageNo: 'V.044N',
    shippingLine: 'CMA CGM Group',
    loadingPort: 'Hazira Port (INHZA1)',
    destinationPort: 'Felixtowe Port (GBFXT)',
    destinationCountry: 'United Kingdom',
    buyerName: 'Britannia Textiles UK Ltd',
    loadingDueDate: '2026-08-02',
    sailDate: '2026-08-04',
    etaDate: '2026-08-22',
    stage: 'Container Stuffed',
    cfsStatus: 'Reached',
    packagingSpec: {
      packageType: 'Corrugated Boxes',
      totalPackages: 1200,
      unitsPerPackage: 10,
      grossWeightKg: 14400,
      netWeightKg: 13800,
      tareWeightKg: 600,
      moistureLossPercentage: 0.1,
      qcPassed: true,
      grnNumber: 'GRN-2026-7840'
    },
    notes: 'Factory stuffing photos verified by Shipzy AI. Gate pass issued.',
    stuffingPhotos: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

export const INITIAL_DRIVE_ASSETS: DriveAsset[] = [
  {
    id: 'asset-1',
    title: 'Container Stuffing Gate Pass Photo',
    fileName: 'MSKU-882190_Stuffing_01.jpg',
    fileType: 'image',
    category: 'Stuffing Photo',
    associatedPiNo: 'EXP/PI/2026/104',
    associatedContainerNo: 'MSKU-882190-4',
    uploadDate: '2026-08-01',
    fileSizeMb: 3.4,
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'asset-2',
    title: 'Commercial Invoice IRN Copy PDF',
    fileName: 'EXP_CI_2026_089_IRN.pdf',
    fileType: 'pdf',
    category: 'Compliance PDF',
    associatedPiNo: 'EXP/PI/2026/104',
    associatedContainerNo: 'MSKU-882190-4',
    uploadDate: '2026-08-01',
    fileSizeMb: 1.2,
    thumbnailUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'asset-3',
    title: 'VGM SOLAS Declaration Copy',
    fileName: 'VGM_Declaration_MSKU882190.pdf',
    fileType: 'pdf',
    category: 'Compliance PDF',
    associatedPiNo: 'EXP/PI/2026/104',
    associatedContainerNo: 'MSKU-882190-4',
    uploadDate: '2026-08-01',
    fileSizeMb: 0.8,
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'asset-4',
    title: 'Fumigation Certificate (Agri Pest Control)',
    fileName: 'Fumigation_Cert_901244.pdf',
    fileType: 'pdf',
    category: 'Quality Cert',
    associatedPiNo: 'EXP/PI/2026/108',
    associatedContainerNo: 'MEDU-901244-1',
    uploadDate: '2026-08-02',
    fileSizeMb: 1.1,
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
  }
];

export const CONTRACT_PROFITABILITY_DATA: ContractProfitability[] = [
  {
    contractNo: 'EXP/CI/2026/089',
    buyerName: 'Hamburg Trade Logistics GmbH',
    fobRevenueUsd: 138000,
    productionCostUsd: 94200,
    logisticsFreightUsd: 12500,
    incentivesRealisedUsd: 4520,
    netProfitUsd: 35820,
    marginPercentage: 25.95
  },
  {
    contractNo: 'EXP/CI/2026/078',
    buyerName: 'Britannia Textiles UK Ltd',
    fobRevenueUsd: 96000,
    productionCostUsd: 68000,
    logisticsFreightUsd: 8900,
    incentivesRealisedUsd: 2900,
    netProfitUsd: 22000,
    marginPercentage: 22.91
  }
];

export const OPERATIONAL_ACTIVITIES: OperationalActivity[] = [
  {
    id: 'act-1',
    timestamp: '10:45 AM Today',
    title: 'eBRC Certificate Closed',
    description: 'Bank Inward Remittance Certificate matched with SB-8902145 for ₹2,64,027 RoDTEP realization.',
    type: 'ebrc',
    user: 'Nishad (EXIM Lead)'
  },
  {
    id: 'act-2',
    timestamp: '09:15 AM Today',
    title: 'e-Invoice IRN & QR Generated',
    description: 'Commercial Invoice EXP/CI/2026/089 signed via NIC portal API.',
    type: 'compliance',
    user: 'System Automated'
  },
  {
    id: 'act-3',
    timestamp: 'Yesterday, 04:30 PM',
    title: 'Fumigation & VGM Certificate Issued',
    description: 'VGM Declaration & Phytosanitary Fumigation proof generated for Container #MSKU-882190-4.',
    type: 'document',
    user: 'Quality Incharge'
  }
];
