// TODO: May need to improve this
// https://github.com/Shopify/shopify-api-node/blob/main/src/auth/scopes/index.ts

export const compareScopes = (a: string, b: string) => {
  const aScopes = Array.from(new Set(a.split(",")));
  const bScopes = Array.from(new Set(b.split(",")));
  return (
    aScopes.length === bScopes.length &&
    aScopes.sort().join(",") === bScopes.sort().join(",")
  );
};
