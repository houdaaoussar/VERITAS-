import { z } from 'zod';

// Target emission categories from the database
export const EMISSION_CATEGORIES = [
  'STATIONARY_COMBUSTION_NATURAL_GAS',
  'MOBILE_COMBUSTION_DIESEL',
  'PROCESS_EMISSIONS',
  'FUGITIVE_EMISSIONS_REFRIGERANTS',
  'STATIONARY_COMBUSTION_LPG'
] as const;

// Target schema fields for data ingestion
export const TARGET_FIELDS = [
  'emission_category',
  'site_name',
  'quantity',
  'unit',
  'activity_date_start',
  'activity_date_end',
  'scope',
  'notes'
] as const;

export type EmissionCategory = typeof EMISSION_CATEGORIES[number];
export type TargetField = typeof TARGET_FIELDS[number];

// Synonyms for intelligent column mapping
export const FIELD_SYNONYMS: Record<TargetField, string[]> = {
  emission_category: [
    'emission_category',
    'category',
    'emission type',
    'activity type',
    'type',
    'emission_type',
    'activity_type',
    'fuel type',
    'fuel_type',
    'source',
    'activity',
    'emission',
    'fuel',
    'energy type',
    'energy_type',
    'fuel type or activity',
    'fuel or activity',
    'activity or fuel',
    'f',
    'fuel/activity'
  ],
  site_name: [
    'site_name',
    'site',
    'location',
    'facility',
    'facility_name',
    'site name',
    'location name',
    'building',
    'office',
    'site id',
    'site_id',
    'facility id',
    'facility_id',
    'gpc ref. no. crf - sector',
    'gpc ref',
    'sector',
    'crf sector'
  ],
  quantity: [
    'quantity',
    'amount',
    'value',
    'consumption',
    'usage',
    'volume',
    'total',
    'qty',
    'activity data',
    'activity_data',
    'activity data - amount',
    'activity amount'
  ],
  unit: [
    'unit',
    'units',
    'measurement unit',
    'uom',
    'unit of measure',
    'measure',
    'activity data - unit',
    'activity data unit'
  ],
  activity_date_start: [
    'activity_date_start',
    'start_date',
    'from_date',
    'date_from',
    'start date',
    'from date',
    'period start',
    'begin date',
    'activity start',
    'date',
    'activity date',
    'activity_date',
    'transaction date',
    'transaction_date',
    'inventory year',
    'year'
  ],
  activity_date_end: [
    'activity_date_end',
    'end_date',
    'to_date',
    'date_to',
    'end date',
    'to date',
    'period end',
    'finish date',
    'activity end',
    'date',
    'activity date',
    'activity_date',
    'transaction date',
    'transaction_date'
  ],
  scope: [
    'scope',
    'emission scope',
    'emission_scope',
    'ghg scope',
    'ghg_scope',
    'scope type',
    'scope_type'
  ],
  notes: [
    'notes',
    'note',
    'comments',
    'comment',
    'description',
    'remarks',
    'details',
    'additional info',
    'desc',
    'activity data - description',
    'activity description'
  ]
};

// Synonyms for emission categories
export const CATEGORY_SYNONYMS: Record<EmissionCategory, string[]> = {
  STATIONARY_COMBUSTION_NATURAL_GAS: [
    'natural gas',
    'naturalgas',
    'natural_gas',
    'ng',
    'gas',
    'stationary combustion natural gas',
    'stationary natural gas',
    'natural gas combustion',
    'electricity',
    'electric',
    'power',
    'grid electricity',
    'mains electricity'
  ],
  MOBILE_COMBUSTION_DIESEL: [
    'diesel',
    'mobile diesel',
    'mobile combustion diesel',
    'diesel fuel',
    'diesel combustion',
    'vehicle diesel',
    'transport diesel'
  ],
  PROCESS_EMISSIONS: [
    'process emissions',
    'process',
    'industrial process',
    'manufacturing',
    'production emissions',
    'process_emissions'
  ],
  FUGITIVE_EMISSIONS_REFRIGERANTS: [
    'refrigerants',
    'refrigerant',
    'fugitive emissions',
    'fugitive refrigerants',
    'fugitive emissions refrigerants',
    'hvac',
    'cooling',
    'ac refrigerant',
    'r134a',
    'r410a'
  ],
  STATIONARY_COMBUSTION_LPG: [
    'lpg',
    'liquefied petroleum gas',
    'liquid petroleum gas',
    'propane',
    'butane',
    'stationary combustion lpg',
    'stationary lpg',
    'lpg combustion'
  ]
};

// Validation schema with coercion (EXTREMELY LENIENT - accept almost anything)
export const IngestRowSchema = z.object({
  emission_category: z.string().min(1, 'Emission category/Activity type is required'),
  site_name: z.string().optional().nullable().default('Unknown Site'),
  quantity: z.coerce.number().optional().default(0), // Accept any number including 0
  unit: z.string().optional().nullable().default('units'),
  activity_date_start: z.coerce.date().optional().or(z.string().optional()).or(z.null()).or(z.undefined()),
  activity_date_end: z.coerce.date().optional().or(z.string().optional()).or(z.null()).or(z.undefined()),
  scope: z.string().optional().nullable(),
  notes: z.string().optional().nullable().default('')
});

export type IngestRow = z.infer<typeof IngestRowSchema>;

// Mapping confidence threshold (0-1)
export const MAPPING_CONFIDENCE_THRESHOLD = 0.6;
