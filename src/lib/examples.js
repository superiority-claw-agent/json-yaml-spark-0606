export const EXAMPLES = [
  {
    id: 'json-release-manifest',
    format: 'json',
    title: 'Release manifest',
    description: 'Nested services, rollout flags, and region-specific hostnames.',
    content: JSON.stringify(
      {
        service: 'spark-gateway',
        version: '2026.04.1',
        enabled: true,
        rollout: {
          strategy: 'canary',
          percent: 25
        },
        regions: ['us-east-1', 'eu-west-1'],
        checks: {
          latencyBudgetMs: 180,
          requiresApproval: false
        }
      },
      null,
      2
    )
  },
  {
    id: 'yaml-worker-stack',
    format: 'yaml',
    title: 'Worker stack config',
    description: 'Queue workers, retry settings, and environment values.',
    content: [
      'service: image-worker',
      'replicas: 3',
      'queue:',
      '  name: thumbnails',
      '  concurrency: 8',
      'retries:',
      '  maxAttempts: 5',
      '  backoffSeconds: 30',
      'features:',
      '  webp: true',
      '  avif: false'
    ].join('\n')
  }
];

export function getExampleById(exampleId) {
  return EXAMPLES.find((example) => example.id === exampleId) || null;
}
