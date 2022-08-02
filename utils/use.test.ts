import { use, wrap, Req, Res, Middleware } from "./use";

const call = async (middleware: Middleware) => {
  const send = jest.fn();
  await wrap(middleware)({} as Req, { send: send as any } as Res);
  return { send };
};

test("calls middleware in order", async () => {
  const middleware = use(
    (req, res, vars: any, next) => {
      vars.foo = true;
      return next();
    },
    (req, res, vars: any) => {
      res.send({ foo: true });
    }
  );
  const { send } = await call(middleware);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith({ foo: true });
});

test("middleware stack can be short-circuited", async () => {
  const middleware = use(
    (req, res, vars: any, next) => {
      res.send({ bar: true });
    },
    (req, res, vars: any) => {
      expect("this not").toBe("called");
      res.send({ foo: true });
    }
  );
  const { send } = await call(middleware);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith({ bar: true });
});

test("middleware chains behave like a stack", async () => {
  expect.assertions(5);
  let i = 0;
  const middleware = use(
    async (req, res, vars: any, next) => {
      vars.foo = true;
      expect(++i).toBe(1);
      await next();
      expect(++i).toBe(3);
    },
    (req, res, vars: any) => {
      expect(++i).toBe(2);
      res.send({ foo: vars.foo });
    }
  );
  const { send } = await call(middleware);
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith({ foo: true });
});

test("final middleware errors when calling next", async () => {
  const middleware = use(
    async (req, res, vars: any, next) => {
      vars.foo = true;
      await next();
    },
    async (req, res, vars: any, next) => {
      await next();
    }
  );
  expect.assertions(1);
  return expect(call(middleware)).rejects.toEqual(
    new Error("Final middleware cannot call next()")
  );
});
