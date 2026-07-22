import { describe, expect, it } from 'vitest'
import { configureArtifactPdfWorker, getArtifactPdfWorkerConfig } from './pdf-worker-config'

describe('artifact PDF worker configuration', () => {
  it('stores one host-controlled worker strategy', () => {
    const workerPort = {} as Worker
    configureArtifactPdfWorker({ workerPort })
    expect(getArtifactPdfWorkerConfig()).toEqual({ workerPort })
    configureArtifactPdfWorker({ workerSrc: '/pdf.worker.mjs' })
    expect(getArtifactPdfWorkerConfig()).toEqual({ workerSrc: '/pdf.worker.mjs' })
  })

  it('rejects ambiguous worker configuration', () => {
    expect(() => configureArtifactPdfWorker({ workerPort: {} as Worker, workerSrc: '/pdf.worker.mjs' })).toThrow('either workerPort or workerSrc')
  })
})
