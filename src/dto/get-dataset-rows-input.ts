import { Type } from 'class-transformer';

export class GetDatasetRowsInput {
  @Type(() => Number)
  from: number;

  @Type(() => Number)
  to: number;
}
