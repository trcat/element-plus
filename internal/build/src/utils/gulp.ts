import { buildRoot } from '@element-plus/build-utils'
import { run } from './process'

import type { TaskFunction } from 'gulp'

/**
 * 为 task function 添加 displayName
 */
export const withTaskName = <T extends TaskFunction>(name: string, fn: T) =>
  Object.assign(fn, { displayName: name })

export const runTask = (name: string) =>
  withTaskName(`shellTask:${name}`, () =>
    run(`pnpm run start ${name}`, buildRoot)
  )
