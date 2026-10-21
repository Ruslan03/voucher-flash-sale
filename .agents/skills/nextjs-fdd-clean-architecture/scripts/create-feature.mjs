#!/usr/bin/env node
/**
 * Agnostic Technical Scaffold Generator for Next.js FDD + Clean Architecture
 * Strictly creates layer boundaries, types, port contracts, and adapter skeletons.
 * DOES NOT generate unsolicited UI styling or finished product components.
 * 
 * Usage: node create-feature.mjs <feature-name> [entity-name]
 * Example: node create-feature.mjs voucher-claim voucher
 */

import fs from 'node:fs'
import path from 'node:path'

const featureArg = process.argv[2]
const entityArg = process.argv[3]

if (!featureArg) {
  console.error('\x1b[31mError: feature-name is required.\x1b[0m')
  console.log('Usage: node create-feature.mjs <feature-name> [entity-name]')
  console.log('Example: node create-feature.mjs voucher-claim voucher')
  process.exit(1)
}

function toCamelCase(str) {
  return str.replace(/[-_]([a-z])/g, (g) => g[1].toUpperCase())
}

function toPascalCase(str) {
  const camel = toCamelCase(str)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

const featureName = featureArg.toLowerCase().trim()
const entityName = (entityArg || featureName.split('-')[0]).toLowerCase().trim()

const PascalEntity = toPascalCase(entityName)
const PascalFeature = toPascalCase(featureName)

// Determine target root (defaults to process.cwd() or src/ directory)
const workspaceRoot = process.cwd()
const srcDir = fs.existsSync(path.join(workspaceRoot, 'src'))
  ? path.join(workspaceRoot, 'src')
  : workspaceRoot

const featureDir = path.join(srcDir, 'features', featureName)

console.log(`\x1b[36m🚀 Scaffolding technical structure for feature "${featureName}" (Entity: "${PascalEntity}")...\x1b[0m`)

const directories = [
  path.join(featureDir, 'domain'),
  path.join(featureDir, 'use-cases'),
  path.join(featureDir, 'infrastructure'),
  path.join(featureDir, 'controllers'),
  path.join(featureDir, 'presentation', 'pages'),
]

directories.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true })
})

// 1. Domain (Pure types and invariants)
const domainContent = `/**
 * DOMAIN LAYER — ${PascalFeature}
 * Pure TypeScript entity definitions and invariants.
 * ZERO framework dependencies.
 */

export interface ${PascalEntity} {
  id: string
  title: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

export class ${PascalEntity}RuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = '${PascalEntity}RuleError'
  }
}

/**
 * Pure domain invariant validation
 */
export function validate${PascalEntity}(item: ${PascalEntity}): void {
  if (!item.title || item.title.trim().length === 0) {
    throw new ${PascalEntity}RuleError('Title is required.')
  }
}
`

const domainTestContent = `import { describe, it, expect } from 'vitest'
import { validate${PascalEntity}, ${PascalEntity}RuleError, type ${PascalEntity} } from './${entityName}'

describe('Domain: ${PascalEntity}', () => {
  it('should validate valid entity', () => {
    const valid: ${PascalEntity} = {
      id: '1',
      title: 'Valid Title',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    expect(() => validate${PascalEntity}(valid)).not.toThrow()
  })

  it('should throw error when title is empty', () => {
    const invalid: ${PascalEntity} = {
      id: '2',
      title: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    expect(() => validate${PascalEntity}(invalid)).toThrow(${PascalEntity}RuleError)
  })
})
`

// 2. Use Cases (Port Interface and Use Case Interactor)
const repoPortContent = `import type { ${PascalEntity} } from '../domain/${entityName}'

/**
 * PORT INTERFACE
 * Contract defining data access requirements for this feature.
 */
export interface ${PascalEntity}Repository {
  findById(id: string): Promise<${PascalEntity} | null>
  findAll(): Promise<${PascalEntity}[]>
  save(item: ${PascalEntity}): Promise<void>
}
`

const useCaseContent = `import type { ${PascalEntity} } from '../domain/${entityName}'
import type { ${PascalEntity}Repository } from './${entityName}-repository'

export class ${PascalEntity}NotFoundError extends Error {
  constructor(id: string) {
    super(\`${PascalEntity} with ID "\${id}" not found.\`)
    this.name = '${PascalEntity}NotFoundError'
  }
}

export async function get${PascalEntity}ById(
  repo: ${PascalEntity}Repository,
  id: string
): Promise<${PascalEntity}> {
  const result = await repo.findById(id)
  if (!result) {
    throw new ${PascalEntity}NotFoundError(id)
  }
  return result
}
`

const useCaseTestContent = `import { describe, it, expect } from 'vitest'
import { get${PascalEntity}ById, ${PascalEntity}NotFoundError } from './get-${entityName}'
import type { ${PascalEntity}Repository } from './${entityName}-repository'
import type { ${PascalEntity} } from '../domain/${entityName}'

describe('Use Case: get${PascalEntity}ById', () => {
  const mockItem: ${PascalEntity} = {
    id: 'test-1',
    title: 'Test Entity',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const mockRepo: ${PascalEntity}Repository = {
    findAll: async () => [mockItem],
    findById: async (id) => (id === mockItem.id ? mockItem : null),
    save: async () => {},
  }

  it('should return entity if found', async () => {
    const item = await get${PascalEntity}ById(mockRepo, 'test-1')
    expect(item.id).toBe('test-1')
  })

  it('should throw ${PascalEntity}NotFoundError if missing', async () => {
    await expect(get${PascalEntity}ById(mockRepo, 'missing-id')).rejects.toThrow(
      ${PascalEntity}NotFoundError
    )
  })
})
`

// 3. Infrastructure (Mock/In-Memory & API Adapters)
const inMemoryRepoContent = `import type { ${PascalEntity} } from '../domain/${entityName}'
import type { ${PascalEntity}Repository } from '../use-cases/${entityName}-repository'

const DEFAULT_ITEM: ${PascalEntity} = {
  id: 'default',
  title: '${PascalFeature}',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export class InMemory${PascalEntity}Repository implements ${PascalEntity}Repository {
  private items: ${PascalEntity}[]

  constructor(initialData?: ${PascalEntity}[]) {
    this.items = initialData ? [...initialData] : [DEFAULT_ITEM]
  }

  async findById(id: string): Promise<${PascalEntity} | null> {
    return this.items.find((i) => i.id === id) ?? this.items[0] ?? null
  }

  async findAll(): Promise<${PascalEntity}[]> {
    return [...this.items]
  }

  async save(item: ${PascalEntity}): Promise<void> {
    const index = this.items.findIndex((i) => i.id === item.id)
    if (index >= 0) this.items[index] = item
    else this.items.push(item)
  }
}
`

const apiRepoContent = `import type { ${PascalEntity} } from '../domain/${entityName}'
import type { ${PascalEntity}Repository } from '../use-cases/${entityName}-repository'
import { httpClient } from '@/shared/infrastructure/http/http-client'

export class Api${PascalEntity}Repository implements ${PascalEntity}Repository {
  constructor(private readonly baseUrl: string = '/api/${featureName}') {}

  async findById(id: string): Promise<${PascalEntity} | null> {
    try {
      return await httpClient.get<${PascalEntity}>(\`\${this.baseUrl}/\${id}\`)
    } catch {
      return null
    }
  }

  async findAll(): Promise<${PascalEntity}[]> {
    return httpClient.get<${PascalEntity}[]>(this.baseUrl)
  }

  async save(item: ${PascalEntity}): Promise<void> {
    await httpClient.post(this.baseUrl, item)
  }
}
`

// 4. Controller (Server Action Adapter)
const controllerContent = `'use server'

import { create${PascalEntity}Repository } from '@/composition/registry'
import { get${PascalEntity}ById, ${PascalEntity}NotFoundError } from '../use-cases/get-${entityName}'
import { type ActionResult, successResult, failureResult } from '@/shared/domain/result'
import type { ${PascalEntity} } from '../domain/${entityName}'

export async function get${PascalEntity}Action(id: string): Promise<ActionResult<${PascalEntity}>> {
  try {
    const repo = create${PascalEntity}Repository()
    const data = await get${PascalEntity}ById(repo, id)
    return successResult(data)
  } catch (error) {
    if (error instanceof ${PascalEntity}NotFoundError) {
      return failureResult(error.message, 'NOT_FOUND')
    }
    const message = error instanceof Error ? error.message : 'Internal error'
    return failureResult(message, 'INTERNAL_ERROR')
  }
}
`

// 5. Presentation (Developer Info Starter Screen like fresh Next.js)
const pageContent = `import { create${PascalEntity}Repository } from '@/composition/registry'
import { get${PascalEntity}ById } from '../../use-cases/get-${entityName}'

interface ${PascalFeature}PageProps {
  id?: string
}

export async function ${PascalFeature}Page({ id = 'default' }: ${PascalFeature}PageProps) {
  const repo = create${PascalEntity}Repository()
  const data = await get${PascalEntity}ById(repo, id)

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1.5rem',
      backgroundColor: '#0a0a0a',
      color: '#ededed',
      boxSizing: 'border-box'
    }}>
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.85rem',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.85rem',
          color: '#a1a1aa',
          marginBottom: '1.25rem'
        }}>
          <span>⚡</span>
          <span>Next.js Clean Architecture &bull; Feature: <strong>${featureName}</strong></span>
        </div>

        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          margin: '0 0 0.75rem',
          letterSpacing: '-0.025em'
        }}>
          Feature <span style={{ color: '#38bdf8' }}>${PascalFeature}</span> Ready
        </h1>

        <p style={{
          fontSize: '1rem',
          color: '#a1a1aa',
          margin: '0 0 2rem',
          lineHeight: 1.5
        }}>
          Kerangka arsitektur telah terpasang. Gunakan petunjuk di bawah ini untuk mulai menambahkan logika bisnis dan tampilan.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '0.85rem',
          textAlign: 'left',
          marginBottom: '2rem'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>1. Domain</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Atur model entity dan aturan bisnis murni di <code>src/features/${featureName}/domain/</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>2. Use Cases</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Tentukan kontrak port dan use case di <code>src/features/${featureName}/use-cases/</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>3. Infrastructure</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Implementasi API / Database adapters di <code>src/features/${featureName}/infrastructure/</code>
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>4. Controllers</span>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: '#d4d4d8' }}>
              Server Actions penghubung UI di <code>src/features/${featureName}/controllers/</code>
            </p>
          </div>
        </div>

        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '0.5rem',
          fontSize: '0.85rem',
          color: '#71717a'
        }}>
          Status Entity: <strong style={{ color: '#34d399' }}>{data.status}</strong> &bull; Title: <code>{data.title}</code>
        </div>
      </div>
    </main>
  )
}
`

// Write all files
const files = [
  { path: path.join(featureDir, 'domain', `${entityName}.ts`), content: domainContent },
  { path: path.join(featureDir, 'domain', `${entityName}.test.ts`), content: domainTestContent },
  { path: path.join(featureDir, 'use-cases', `${entityName}-repository.ts`), content: repoPortContent },
  { path: path.join(featureDir, 'use-cases', `get-${entityName}.ts`), content: useCaseContent },
  { path: path.join(featureDir, 'use-cases', `get-${entityName}.test.ts`), content: useCaseTestContent },
  { path: path.join(featureDir, 'infrastructure', `in-memory-${entityName}-repository.ts`), content: inMemoryRepoContent },
  { path: path.join(featureDir, 'infrastructure', `api-${entityName}-repository.ts`), content: apiRepoContent },
  { path: path.join(featureDir, 'controllers', `${featureName}-controller.ts`), content: controllerContent },
  { path: path.join(featureDir, 'presentation', 'pages', `${featureName}-page.tsx`), content: pageContent },
]

files.forEach((f) => {
  fs.writeFileSync(f.path, f.content, 'utf-8')
  console.log(`  \x1b[32m✔ Created\x1b[0m ${path.relative(workspaceRoot, f.path)}`)
})

console.log(`\n\x1b[32m✨ Feature skeleton for "${featureName}" created!\x1b[0m\n`)
console.log('\x1b[33mWiring Instructions:\x1b[0m')
console.log(`1. In \x1b[34msrc/composition/registry.ts\x1b[0m, export:`)
console.log(`   export function create${PascalEntity}Repository(): ${PascalEntity}Repository { ... }`)
console.log(`2. In \x1b[34msrc/app/<route>/page.tsx\x1b[0m, mount:`)
console.log(`   <${PascalFeature}Page id={...} />`)
