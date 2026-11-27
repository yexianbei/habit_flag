#!/usr/bin/env node
/**
 * 小版本号 +1（patch）。大版本/次版本需人工确认后再改 package.json。
 * 用法: node scripts/bump-patch.mjs
 */
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const parts = String(pkg.version || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0)
while (parts.length < 3) parts.push(0)
parts[2] += 1
pkg.version = parts.slice(0, 3).join('.')
writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n')
console.log(pkg.version)
