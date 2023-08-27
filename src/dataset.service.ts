import { Injectable } from '@nestjs/common';
import { LoadDatasetInput } from './dto/load-dataset.input';
import { BigQuery } from '@google-cloud/bigquery';
import { PROJECT_ROOT } from './constants';
import * as path from 'path';
import { GetDatasetRowsInput } from './dto/get-dataset-rows-input';
import { GetDatasetRowsOutput } from './dto/get-dataset-rows-output';

const PROJECT_ID = 'proj-2023-08-07-urauth0-dev';
const DATASET_ID = 'ai_tracking';
const KEY_FILENAME = 'gcp-service-account-keyfile.json';

const options = {
  keyFilename: path.join(PROJECT_ROOT, '../', KEY_FILENAME),
  projectId: PROJECT_ID,
};

const bigquery = new BigQuery(options);

export enum DatasetId {
  CC = 0,
  C4 = 4,
  LAION_5B = 5,
}

export interface Dataset {
  source_url: string;
  document_url?: string;
  timestamp: string;
  summary: string;
  type: string;
  dataset_id: number;
  dataset_number: number;
  bytes: number;
}

@Injectable()
export abstract class DatasetService {
  abstract getDatasetRows(
    getDatasetRowsInput: GetDatasetRowsInput,
  ): Promise<GetDatasetRowsOutput>;
  abstract loadDataset(loadDatasetInput: LoadDatasetInput): Promise<void>;

  async insertDataset(datasetList: Dataset[]): Promise<void> {
    const tableId = 'datasets';
    try {
      const table = bigquery.dataset(DATASET_ID).table(tableId);
      await table.insert(datasetList);
      console.log(`Inserted ${datasetList.length} rows into ${tableId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(`Error inserting data into BigQuery: ${error.message}`);
      throw error;
    }
  }
}
