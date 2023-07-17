# Element Plus 打包配置



## 实际打包命令

`gulp --require @esbuild-kit/cjs-loader -f gulpfile.ts`

1. 使用 `gulp`
1. [@esbuid-kit/cjs-loader](https://github.com/esbuild-kit/cjs-loader)的作用是转换 ESM & TypeScript 成 CommonJS。这里使用 `--require` 指在执行 guplfile 前先引入该包。
1. 使用 `gulpfile.ts` 作为配置文件



## 配置文件中的任务

```typescript
export default series(
  withTaskName('clean', () => run('pnpm run clean')),
  withTaskName('createOutput', () => mkdir(epOutput, { recursive: true })),

  parallel(
    runTask('buildModules'),
    runTask('buildFullBundle'),
    runTask('generateTypesDefinitions'),
    runTask('buildHelper'),
    series(
      withTaskName('buildThemeChalk', () =>
        run('pnpm run -C packages/theme-chalk build')
      ),
      copyFullStyle
    )
  ),

  parallel(copyTypesDefinitions, copyFiles)
)

```



1. 执行 `pnpm run clean` 清空指令
   1. 实际执行的操作为
      1.  `rimraf dist` 清空更目录 `dist` 文件夹
      2. `pnpm run -r --parallel clean` 执行所有包中的清空命令
2. 创建文件夹，此处 `epOutput` 的值为 `/dist/element-plus`
3. 借助 `gulp.parallel` 并行执行以下任务
   1. `buildModules` ：通过 `rollup` 打包 packages 文件中的模块
      1. 借助 `fast-glob` 找出全部入口文件充当 `rollup` 的 `input` 
      2. 使用到的插件
         1. `ElementPlusAlias`: 自定义插件，主题路径重定向，@element-plus/theme-chalk -> element-plus/theme-chalk
         2. [unplugin-vue-macros/rollup](https://vue-macros.sxzz.moe/):  通过该插件来处理 vue 组件
            1. 主要还是想使用一些还没有被 vue 实现的功能
            2. `setupComponent` 和 `setupSFC` 都设定为 false，应该是了保证组件打包后的正确性，避免对单文件组件和 setup 函数进行处理，不受插件的影响
         3. `@rollup/plugin-node-resolve` 处理从第三方依赖的引入
         4. `@rollup/plugin-commonjs` 编译 commonjs 模块以支持该类型依赖的引入
         5. `esbuild` ：利用 esbuild 编译器来加速 JavaScript 代码的转换和压缩过程，提高构建速度并生成更小的代码包
            1. 目标环境为 `es2018`
            2. 用 TypeScript 来处理 Vue 单文件组件
      3. `external` 设定外部依赖
      4. 关闭 `treeshake`，应该是为了组件库打包后的内容的完整性和正确性

