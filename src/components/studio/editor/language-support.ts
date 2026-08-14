/**
 * 语言 id → 语言包动态加载器。
 *
 * key 与 inferLanguageId 的返回值一致。语言包按需 import()，因此未用到的语言
 * 不会进入宿主的首屏 chunk。宿主可以通过 HoloCodeEditor 的 languages prop 覆盖或扩展。
 *
 * 返回值类型是 unknown：这样本文件的类型声明不会把 @codemirror/* 泄漏到
 * ./studio 的公共类型里（尽管本文件本身属于 ./studio/editor 入口）。
 */
export const studioLanguageSupport: Record<string, () => Promise<unknown>> = {
  typescript: () => import('@codemirror/lang-javascript').then(module => module.javascript({ typescript: true, jsx: true })),
  javascript: () => import('@codemirror/lang-javascript').then(module => module.javascript({ jsx: true })),
  json: () => import('@codemirror/lang-json').then(module => module.json()),
  markdown: () => import('@codemirror/lang-markdown').then(module => module.markdown()),
  python: () => import('@codemirror/lang-python').then(module => module.python()),
  rust: () => import('@codemirror/lang-rust').then(module => module.rust()),
  html: () => import('@codemirror/lang-html').then(module => module.html()),
  css: () => import('@codemirror/lang-css').then(module => module.css()),
  scss: () => import('@codemirror/lang-css').then(module => module.css()),
  less: () => import('@codemirror/lang-css').then(module => module.css()),
}
