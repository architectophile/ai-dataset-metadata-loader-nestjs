import { Type } from 'class-transformer';

export class LoadDatasetInput {
  @Type(() => Number)
  from: number;

  @Type(() => Number)
  to: number;
}
