import { Injectable } from '@nestjs/common';
import { LoadDatasetInput } from './dto/load-dataset.input';
import { C4Service } from './c4.service';
import { Laion5BService } from './laion-5b.service';
import { GetDatasetRowsInput } from './dto/get-dataset-rows-input';
import { GetDatasetRowsOutput } from './dto/get-dataset-rows-output';

@Injectable()
export class AppService {
  constructor(
    private readonly c4Service: C4Service,
    private readonly laion5BService: Laion5BService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async loadDataset(
    dataset: string,
    loadDatasetInput: LoadDatasetInput,
  ): Promise<void> {
    switch (dataset) {
      case 'c4':
        return this.c4Service.loadDataset(loadDatasetInput);
      case 'laion-5b':
        return this.laion5BService.loadDataset(loadDatasetInput);
      default:
        throw new Error(`Unknown dataset: ${dataset}`);
    }
  }

  async getDatasetRows(
    dataset: string,
    getDatasetRowsInput: GetDatasetRowsInput,
  ): Promise<GetDatasetRowsOutput> {
    switch (dataset) {
      case 'c4':
        return this.c4Service.getDatasetRows(getDatasetRowsInput);
      case 'laion-5b':
        return this.laion5BService.getDatasetRows(getDatasetRowsInput);
      default:
        throw new Error(`Unknown dataset: ${dataset}`);
    }
  }
}
