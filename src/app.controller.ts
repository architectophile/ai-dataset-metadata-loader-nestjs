import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { LoadDatasetInput } from './dto/load-dataset.input';
import { GetDatasetRowsInput } from './dto/get-dataset-rows-input';
import { GetDatasetRowsOutput } from './dto/get-dataset-rows-output';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('c4/rows')
  async getDatasetC4Rows(
    @Body() getDatasetRowsInput: GetDatasetRowsInput,
  ): Promise<GetDatasetRowsOutput> {
    return this.appService.getDatasetRows('c4', getDatasetRowsInput);
  }

  @Post('c4/load')
  async loadDatasetC4(@Body() loadDatasetInput: LoadDatasetInput) {
    return this.appService.loadDataset('c4', loadDatasetInput);
  }

  @Post('laion-5b/rows')
  async getDatasetLaion5BRows(
    @Body() getDatasetRowsInput: GetDatasetRowsInput,
  ): Promise<GetDatasetRowsOutput> {
    return this.appService.getDatasetRows('laion-5b', getDatasetRowsInput);
  }

  @Post('laion-5b/load')
  async loadDatasetLaion5B(@Body() loadDatasetInput: LoadDatasetInput) {
    return this.appService.loadDataset('laion-5b', loadDatasetInput);
  }
}
