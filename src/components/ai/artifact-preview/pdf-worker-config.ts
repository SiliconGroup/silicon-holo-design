export interface ArtifactPdfWorkerConfig {
  workerPort?: Worker
  workerSrc?: string
}

let pdfWorkerConfig: ArtifactPdfWorkerConfig = {}

export function configureArtifactPdfWorker(config: ArtifactPdfWorkerConfig) {
  if (config.workerPort && config.workerSrc) throw new Error('Configure either workerPort or workerSrc, not both.')
  pdfWorkerConfig = { ...config }
}

export function getArtifactPdfWorkerConfig() {
  return pdfWorkerConfig
}
