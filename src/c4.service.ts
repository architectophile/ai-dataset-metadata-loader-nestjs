import { Injectable } from '@nestjs/common';
import { Dataset, DatasetId, DatasetService } from './dataset.service';
import { LoadDatasetInput } from './dto/load-dataset.input';
import { convertNumTo5Str } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { formatISO, parseISO } from 'date-fns';
import { PROJECT_ROOT } from './constants';
import { GetDatasetRowsInput } from './dto/get-dataset-rows-input';
import { GetDatasetRowsOutput } from './dto/get-dataset-rows-output';

interface C4Dataset {
  text: string;
  timestamp: string;
  url: string;
}

@Injectable()
export class C4Service extends DatasetService {
  async getDatasetRows({
    from,
    to,
  }: GetDatasetRowsInput): Promise<GetDatasetRowsOutput> {
    let count = 0;
    for (let i = from; i <= to; i++) {
      const fileName = `c4-train.${convertNumTo5Str(i)}-of-01024.json`;
      try {
        const rows: number = await this.countRows(fileName);
        console.log(`Rows of ${fileName} is ${rows}`);
        count += rows;
      } catch (error: any) {
        console.error(
          `Error loading and storing on ${fileName}: ${error.message}`,
        );
        throw error;
      }
    }

    console.log(`Total rows of C4 datasets from ${from} to ${to} is ${count}`);
    return { rows: count };
  }

  private async countRows(fileName: string): Promise<number> {
    const filePath = path.join(PROJECT_ROOT, '../datasets/c4/en/', fileName);
    let count = 0;

    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: readStream,
    });

    return new Promise<number>((resolve, reject) => {
      rl.on('line', (line: string): void => {
        count += 1;
      });

      rl.on('close', (): void => {
        resolve(count);
      });

      rl.on('error', (error: { message: any }) => {
        reject(`Error reading file: ${error.message}`);
      });
    });
  }

  async loadDataset({ from, to }: LoadDatasetInput): Promise<void> {
    for (let i = from; i <= to; i++) {
      const fileName = `c4-train.${convertNumTo5Str(i)}-of-01024.json`;
      try {
        await this.loadFileAndStore(fileName, i);
        console.log(`loadFileAndStore call: ${fileName} done`);
      } catch (error: any) {
        console.error(
          `Error loading and storing on ${fileName}: ${error.message}`,
        );
        throw error;
      }
    }
  }

  private async loadFileAndStore(
    fileName: string,
    datasetNumber: number,
  ): Promise<void> {
    const filePath = path.join(PROJECT_ROOT, '../datasets/c4/en/', fileName);
    let datasetList: Dataset[] = [];

    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });
    const rl = readline.createInterface({
      input: readStream,
    });

    return new Promise<void>((resolve, reject) => {
      rl.on('line', async (line: string): Promise<void> => {
        try {
          const c4Dataset: C4Dataset = JSON.parse(line);
          datasetList.push({
            source_url: c4Dataset.url,
            timestamp: formatISO(parseISO(c4Dataset.timestamp), {
              representation: 'complete',
            }),
            summary: c4Dataset.text.slice(0, 100).trim(),
            type: 'txt',
            dataset_id: DatasetId.C4,
            dataset_number: datasetNumber,
            bytes: Buffer.byteLength(c4Dataset.text, 'utf8'),
          });
          if (datasetList.length % 1000 === 0) {
            const tempDatasetList = datasetList;
            datasetList = [];
            await this.insertDataset(tempDatasetList);
          }
        } catch (error: any) {
          reject(`Error inserting dataset: ${error.message}`);
        }
      });

      rl.on('close', async () => {
        try {
          if (datasetList.length > 0) {
            await this.insertDataset(datasetList);
          }
          resolve();
        } catch (error) {
          reject(`Error inserting dataset: ${error.message}`);
        }
      });

      rl.on('error', (error: { message: any }) => {
        reject(`Error reading file: ${error.message}`);
      });
    });
  }
}
