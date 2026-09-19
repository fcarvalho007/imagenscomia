// Deno resolves npm: specifiers natively. This bridge keeps the same shared
// modules type-checkable inside the bundled app.
declare module "npm:htmlparser2@10.0.0" {
  export * from "htmlparser2";
}
