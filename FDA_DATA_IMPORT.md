# FDA Drug Data Import Instructions

## About the Dataset
The FDA Drugs dataset from Kaggle contains comprehensive information about drugs approved by the US FDA. You can access it here:
https://www.kaggle.com/datasets/protobioengineering/united-states-fda-drugs-feb-2024

## How to Import Data

### Option 1: Manual Import via Backend Interface

1. **Download the Dataset**
   - Go to the Kaggle link above
   - Download the CSV file(s)

2. **Access Your Backend**
   - Click "View Backend" in the Lovable interface
   - Navigate to Database → Tables → drugs

3. **Import Data**
   - Use the import feature to upload your CSV
   - Map the following columns:
     - `drug_id` → Unique identifier
     - `name` → Drug name
     - `batch_no` → Generate unique batch numbers (format: BATCH-XXXX)
     - `manufacturer` → Manufacturer name
     - `active_ingredient` → Active ingredient
     - `dosage_form` → Dosage form
     - `mfg_date` → Manufacturing date (use current date - 1 year as default)
     - `exp_date` → Expiry date (use current date + 2 years as default)
     - `type` → Set to 'authentic' for real FDA drugs
     - `risk_level` → Classify based on drug category (low/medium/high/critical)

### Option 2: SQL Import Script

If you have the CSV file, you can create a SQL script to import the data. Here's a template:

```sql
-- First, prepare your CSV data with the required columns
-- Then use COPY command or INSERT statements

-- Example INSERT statement:
INSERT INTO drugs (
  drug_id, 
  name, 
  batch_no, 
  manufacturer, 
  active_ingredient, 
  dosage_form,
  mfg_date,
  exp_date,
  type,
  risk_level
) VALUES
  ('FDA001', 'Aspirin', 'BATCH-0001', 'Bayer', 'Acetylsalicylic Acid', 'Tablet', '2023-01-01', '2025-01-01', 'authentic', 'low'),
  ('FDA002', 'Ibuprofen', 'BATCH-0002', 'Advil', 'Ibuprofen', 'Tablet', '2023-01-01', '2025-01-01', 'authentic', 'low');
-- ... continue for all drugs
```

### Option 3: Programmatic Import

Create a data import script that:
1. Reads the FDA CSV file
2. Transforms the data to match your schema
3. Inserts it into the database using the Supabase client

Example structure:
```typescript
// This is pseudocode - adapt to your needs
import { supabase } from './supabase-client';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

async function importFDAData() {
  const csvContent = fs.readFileSync('fda_drugs.csv', 'utf-8');
  const records = parse(csvContent, { columns: true });
  
  for (const record of records) {
    const drugData = {
      drug_id: record.application_number,
      name: record.brand_name,
      batch_no: `BATCH-${Math.random().toString(36).substr(2, 9)}`,
      manufacturer: record.sponsor_name,
      active_ingredient: record.active_ingredients,
      dosage_form: record.dosage_form,
      mfg_date: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      exp_date: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'authentic',
      risk_level: calculateRiskLevel(record)
    };
    
    await supabase.from('drugs').insert(drugData);
  }
}
```

## Data Transformation Notes

1. **Batch Numbers**: The FDA dataset doesn't include batch numbers. Generate unique ones for each drug.

2. **Dates**: The FDA dataset may not have manufacturing/expiry dates. Use reasonable defaults:
   - Manufacturing: 1 year ago
   - Expiry: 2-3 years from now (depending on drug type)

3. **Risk Levels**: Classify drugs based on:
   - `low`: OTC medications, vitamins
   - `medium`: Common prescription drugs
   - `high`: Controlled substances, potent medications
   - `critical`: High-alert medications, chemotherapy drugs

4. **Type**: All FDA-approved drugs should be marked as `authentic`

## Testing After Import

1. Navigate to Drug Verification page
2. Search for a drug using its batch number
3. Verify that all information displays correctly
4. Test QR code scanning with generated batch numbers

## Important Notes

- The database already has sample data. You may want to clear it before importing FDA data.
- Ensure you have proper permissions to use the FDA dataset.
- Consider data privacy and usage rights for the FDA dataset.
- Start with a small subset of data to test the import process before importing the full dataset.
