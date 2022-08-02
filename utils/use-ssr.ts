// https://gist.github.com/richardscarrott/cf314c28580e31099e3484ba6f950f2b

import { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

/**
 * Middleware stack for next.js `getServerSideProps` and Api Routes
 *
 * Usage:
 *
 * const withUser: Middleware<{ user?: User }> = async (ctx, vars, next) => {
 *   if (vars.user) {
 *     return next();
 *   }
 *   vars.user = await getUser(ctx.session.userId);
 *   return next();
 * }
 *
 * const role = (role: string): Middleware =>  use(withUser, (ctx, vars, next) => {
 *   if (!vars.user) {
 *     return { redirect: { destination: '/login', permanent: false } };
 *   }
 *   if (!vars.user.roles.includes(role)) {
 *      return { notFound: true };
 *   }
 *   return next();
 * });
 *
 * const stack = use(role('ADMIN'), withUser, (ctx, vars) => ({
 *   props: { username: vars.user.username }
 * });
 *
 * export const getServerSideProps = wrap(stack);
 */

export type Ctx = GetServerSidePropsContext;
export type Result = GetServerSidePropsResult<any>;

export type NextFn = () => Result | Promise<Result>;

export type SsrMiddleware<Vars extends {} = {}> = (
  ctx: Ctx,
  vars: Partial<Vars>,
  next: NextFn
) => Promise<Result> | Result;

// Like `Middleware` but allows call site to decide which vars have already been applied
type AppliedSsrMiddleware<Vars extends {}> = (
  ctx: Ctx,
  vars: Vars,
  next: NextFn
) => Promise<Result> | Result;

interface UseSsr {
  <Fn1Vars>(fn1: SsrMiddleware<Fn1Vars>): SsrMiddleware<Partial<Fn1Vars>>;
  <Fn1Vars, Fn2Vars>(
    fn1: SsrMiddleware<Fn1Vars>,
    fn2: AppliedSsrMiddleware<Fn1Vars & Partial<Fn2Vars>>
  ): SsrMiddleware<Fn1Vars & Fn2Vars>;
  <Fn1Vars, Fn2Vars, Fn3Vars>(
    fn1: SsrMiddleware<Fn1Vars>,
    fn2: AppliedSsrMiddleware<Fn1Vars & Partial<Fn2Vars>>,
    fn3: AppliedSsrMiddleware<Fn1Vars & Fn2Vars & Partial<Fn3Vars>>
  ): SsrMiddleware<Fn1Vars & Fn2Vars & Fn3Vars>;
  <Fn1Vars, Fn2Vars, Fn3Vars, Fn4Vars>(
    fn1: SsrMiddleware<Fn1Vars>,
    fn2: AppliedSsrMiddleware<Fn1Vars & Partial<Fn2Vars>>,
    fn3: AppliedSsrMiddleware<Fn1Vars & Fn2Vars & Partial<Fn3Vars>>,
    fn4: AppliedSsrMiddleware<Fn1Vars & Fn2Vars & Fn3Vars & Partial<Fn4Vars>>
  ): SsrMiddleware<Fn1Vars & Fn2Vars & Fn3Vars & Fn4Vars>;
  <Fn1Vars, Fn2Vars, Fn3Vars, Fn4Vars, Fn5Vars>(
    fn1: SsrMiddleware<Fn1Vars>,
    fn2: AppliedSsrMiddleware<Fn1Vars & Partial<Fn2Vars>>,
    fn3: AppliedSsrMiddleware<Fn1Vars & Fn2Vars & Partial<Fn3Vars>>,
    fn4: AppliedSsrMiddleware<Fn1Vars & Fn2Vars & Fn3Vars & Partial<Fn4Vars>>,
    fn5: AppliedSsrMiddleware<
      Fn1Vars & Fn2Vars & Fn3Vars & Fn4Vars & Partial<Fn5Vars>
    >
  ): SsrMiddleware<Fn1Vars & Fn2Vars & Fn3Vars & Fn4Vars & Fn5Vars>;
}

export const useSsr: UseSsr =
  (...middleware: SsrMiddleware<any>[]) =>
  (ctx: Ctx, vars: any, next: NextFn) => {
    let idx = 0;
    const _next = () => {
      const fn = middleware[idx++];
      if (!fn) {
        return next();
      }
      return fn(ctx, vars, _next);
    };
    return _next();
  };

export const wrapSsr =
  (middleware: SsrMiddleware<any>) =>
  async (ctx: Ctx): Promise<Result> => {
    const result = await middleware(ctx, {}, () => {
      // TODO: Can this be caught with TS; e.g. FinalMiddleware?
      throw new Error("Final middleware cannot call next()");
    });
    if (!result) {
      // TODO: Can this be caught with TS; e.g. FinalMiddleware?
      throw new Error("Final middleware must return a `Result`");
    }
    return result;
  };
