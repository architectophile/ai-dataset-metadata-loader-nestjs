import { Injectable } from '@nestjs/common';
import { Dataset, DatasetId, DatasetService } from './dataset.service';
import { LoadDatasetInput } from './dto/load-dataset.input';
import { convertNumTo5Str } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import { PROJECT_ROOT } from './constants';
import { GetDatasetRowsInput } from './dto/get-dataset-rows-input';
import { GetDatasetRowsOutput } from './dto/get-dataset-rows-output';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AutoDetectDecoderStream = require('autodetect-decoder-stream');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CsvReadableStream = require('csv-reader');

interface Laion5BDataset {
  url: string;
  text: string;
  width: number;
  height: number;
  similarity: number;
  punsafe: number;
  pwatermark: number;
  aesthetic: number;
  hash: string;
  __index_level_0__: number;
}

@Injectable()
export class Laion5BService extends DatasetService {
  async getDatasetRows({
    from,
    to,
  }: GetDatasetRowsInput): Promise<GetDatasetRowsOutput> {
    let count = 0;
    for (let i = from; i <= to; i++) {
      const fileName = `train-${convertNumTo5Str(i)}-of-00007.csv`;
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

    console.log(
      `Total rows of Laion-5B datasets from ${from} to ${to} is ${count}`,
    );
    return { rows: count };
  }

  private async countRows(fileName: string): Promise<number> {
    const filePath = path.join(PROJECT_ROOT, '../datasets/laion-5b/', fileName);
    let count = -1;

    const inputStream = fs
      .createReadStream(filePath)
      .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' })); // If failed to guess encoding, default to 1255

    // The AutoDetectDecoderStream will know if the stream is UTF8, windows-1255, windows-1252 etc.
    // It will pass a properly decoded data to the CsvReader.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any

    return new Promise<number>((resolve, reject) => {
      inputStream
        .pipe(
          new CsvReadableStream({
            parseNumbers: true,
            parseBooleans: true,
            trim: true,
          }),
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('data', function (row: any): void {
          count += 1;
        })
        .on('end', function (): void {
          resolve(count);
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('error', function (error: any) {
          reject(`Error reading file: ${error.message}`);
        });
    });
  }

  async loadDataset({ from, to }: LoadDatasetInput): Promise<void> {
    for (let i = from; i <= to; i++) {
      const fileName = `train-${convertNumTo5Str(i)}-of-00007.csv`;
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
    const filePath = path.join(PROJECT_ROOT, '../datasets/laion-5b/', fileName);
    let datasetList: Dataset[] = [];

    const inputStream = fs
      .createReadStream(filePath)
      .pipe(new AutoDetectDecoderStream({ defaultEncoding: '1255' })); // If failed to guess encoding, default to 1255

    // The AutoDetectDecoderStream will know if the stream is UTF8, windows-1255, windows-1252 etc.
    // It will pass a properly decoded data to the CsvReader.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let count = 0;

    return new Promise<void>((resolve, reject) => {
      inputStream
        .pipe(
          new CsvReadableStream({
            parseNumbers: true,
            parseBooleans: true,
            trim: true,
          }),
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('data', async (row: any): Promise<void> => {
          if (count !== 0) {
            datasetList.push({
              source_url: row[0] + '',
              timestamp: '2022-03-03T00:00:00+00:00',
              summary: (row[1] + '').slice(0, 100).trim(),
              type: 'img',
              dataset_id: DatasetId.LAION_5B,
              dataset_number: datasetNumber,
              bytes: Buffer.byteLength(row[1] + '', 'utf8'),
            });
            if (datasetList.length % 1000 === 0) {
              const tempDatasetList = datasetList;
              datasetList = [];
              await this.insertDataset(tempDatasetList);
            }
          }
          count++;
        })
        .on('end', async (): Promise<void> => {
          try {
            if (datasetList.length > 0) {
              await this.insertDataset(datasetList);
            }
            resolve();
          } catch (error) {
            reject(`Error inserting dataset: ${error.message}`);
          }
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('error', function (error: any) {
          reject(`Error reading file: ${error.message}`);
        });
    });
  }
}
