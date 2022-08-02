// https://gist.github.com/richardscarrott/cf314c28580e31099e3484ba6f950f2b

import { NextApiRequest, NextApiResponse } from "next";

export type Req = NextApiRequest;
export type Res = NextApiResponse;

export type NextFn = () => void | Promise<void>;

export type Middleware<Vars extends {} = {}> = (
  req: Req,
  res: Res,
  vars: Partial<Vars>,
  next: NextFn
) => Promise<void> | void;

// Like `Middleware` but allows call site to decide which vars have already been applied
type AppliedMiddleware<Vars extends {}> = (
  req: Req,
  res: Res,
  vars: Vars,
  next: NextFn
) => Promise<void> | void;

interface Use {
  <Fn1Vars>(fn1: Middleware<Fn1Vars>): Middleware<Partial<Fn1Vars>>;
  <Fn1Vars, Fn2Vars>(
    fn1: Middleware<Fn1Vars>,
    fn2: AppliedMiddleware<Fn1Vars & Partial<Fn2Vars>>
  ): Middleware<Fn1Vars & Fn2Vars>;
  <Fn1Vars, Fn2Vars, Fn3Vars>(
    fn1: Middleware<Fn1Vars>,
    fn2: AppliedMiddleware<Fn1Vars & Partial<Fn2Vars>>,
    fn3: AppliedMiddleware<Fn1Vars & Fn2Vars & Partial<Fn3Vars>>
  ): Middleware<Fn1Vars & Fn2Vars & Fn3Vars>;
  <Fn1Vars, Fn2Vars, Fn3Vars, Fn4Vars>(
    fn1: Middleware<Fn1Vars>,
    fn2: AppliedMiddleware<Fn1Vars & Partial<Fn2Vars>>,
    fn3: AppliedMiddleware<Fn1Vars & Fn2Vars & Partial<Fn3Vars>>,
    fn4: AppliedMiddleware<Fn1Vars & Fn2Vars & Fn3Vars & Partial<Fn4Vars>>
  ): Middleware<Fn1Vars & Fn2Vars & Fn3Vars & Fn4Vars>;
  <Fn1Vars, Fn2Vars, Fn3Vars, Fn4Vars, Fn5Vars>(
    fn1: Middleware<Fn1Vars>,
    fn2: AppliedMiddleware<Fn1Vars & Partial<Fn2Vars>>,
    fn3: AppliedMiddleware<Fn1Vars & Fn2Vars & Partial<Fn3Vars>>,
    fn4: AppliedMiddleware<Fn1Vars & Fn2Vars & Fn3Vars & Partial<Fn4Vars>>,
    fn5: AppliedMiddleware<
      Fn1Vars & Fn2Vars & Fn3Vars & Fn4Vars & Partial<Fn5Vars>
    >
  ): Middleware<Fn1Vars & Fn2Vars & Fn3Vars & Fn4Vars & Fn5Vars>;
}

export const use: Use =
  (...middleware: Middleware<any>[]) =>
  (req: Req, res: Res, vars: any, next: NextFn) => {
    let idx = 0;
    const _next = () => {
      const fn = middleware[idx++];
      if (!fn) {
        return next();
      }
      return fn(req, res, vars, _next);
    };
    return _next();
  };

export const wrap =
  (middleware: Middleware<any>) =>
  async (req: Req, res: Res): Promise<void> => {
    const result = await middleware(req, res, {}, () => {
      // TODO: Can this be caught with TS; e.g. FinalMiddleware?
      throw new Error("Final middleware cannot call next()");
    });
    return result;
  };
