import { Type } from 'class-transformer';

export class GetDatasetRowsOutput {
  @Type(() => Number)
  rows: number;
}
