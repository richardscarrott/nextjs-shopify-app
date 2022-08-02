import { useSsr, wrapSsr, Ctx, SsrMiddleware } from "./use-ssr";

const call = (middleware: SsrMiddleware) =>
  wrapSsr(middleware)({
    query: {},
    req: {},
    res: {},
  } as Ctx);

test("calls middleware in order", async () => {
  const middleware = useSsr(
    (ctx, vars: any, next) => {
      vars.foo = true;
      return next();
    },
    (ctx, vars: any) => {
      return { props: { foo: vars.foo } };
    }
  );
  expect(await call(middleware)).toEqual({
    props: { foo: true },
  });
});

test("middleware stack can be short-circuited", async () => {
  const middleware = useSsr(
    (ctx, vars: any, next) => {
      return { props: { short: "circuit" } };
    },
    (ctx, vars: any) => {
      expect("this not").toBe("called");
      return { props: { foo: vars.foo } };
    }
  );
  expect(await call(middleware)).toEqual({
    props: { short: "circuit" },
  });
});

test("middleware chains behave like a stack", async () => {
  expect.assertions(4);
  let i = 0;
  const middleware = useSsr(
    async (ctx, vars: any, next) => {
      vars.foo = true;
      expect(++i).toBe(1);
      const ret = await next();
      expect(++i).toBe(3);
      return ret;
    },
    (ctx, vars: any) => {
      expect(++i).toBe(2);
      return { props: { foo: vars.foo } };
    }
  );
  expect(await call(middleware)).toEqual({
    props: { foo: true },
  });
});

test("final middleware errors when calling next", async () => {
  const middleware = useSsr(
    (ctx, vars: any, next) => {
      vars.foo = true;
      return next();
    },
    (ctx, vars: any, next) => {
      return next();
    }
  );
  expect.assertions(1);
  return expect(call(middleware)).rejects.toEqual(
    new Error("Final middleware cannot call next()")
  );
});

test("final middleware errors if no result is returned", async () => {
  const middleware = useSsr(
    (ctx, vars: any, next) => {
      vars.foo = true;
      return next();
    },
    // @ts-ignore
    (ctx, vars: any, next) => {
      return;
    }
  );
  expect.assertions(1);
  return expect(call(middleware)).rejects.toEqual(
    new Error("Final middleware must return a `Result`")
  );
});
