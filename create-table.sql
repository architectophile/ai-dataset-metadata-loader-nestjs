CREATE TABLE `proj-2023-08-07-urauth0-dev.ai_tracking.datasets` (
  source_url STRING NOT NULL,
  document_url STRING,
  summary STRING NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  type STRING NOT NULL,
  dataset_id INTEGER NOT NULL,
  dataset_number INTEGER NOT NULL,
  bytes INTEGER NOT NULL
);

CREATE SEARCH INDEX src_url_doc_url_index
ON ai_tracking.datasets(source_url, document_url);