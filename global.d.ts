declare module "abcjs" {
  const abcjs: {
    renderAbc: (element: HTMLElement, abc: string, params?: Record<string, unknown>) => unknown;
  };
  export = abcjs;
}
