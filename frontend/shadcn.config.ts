export const shadcnPluginConfig = {
  $schema: "https://ui.shadcn.com/schema.json",
  framework: "react",
  style: "default",
  tailwind: {
    config: "tailwind.config.cjs", 
    css: "src/index.css",
    baseColor: "primary",
    cssVariables: true
  },
  paths: {
    components: "src/components",
    utils: "src/lib/utils.ts"
  }
}
