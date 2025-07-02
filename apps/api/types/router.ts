import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Generic route handler type that accepts proper Express types
export type RouteHandler<
  P = ParamsDictionary,
  ResBody = any,
  ReqBody = any,
  ReqQuery = ParsedQs,
  LocalsObj extends Record<string, any> = Record<string, any>
> = (
  req: Request<P, ResBody, ReqBody, ReqQuery, LocalsObj>,
  res: Response<ResBody, LocalsObj>,
  next?: NextFunction
) => Promise<void | Response<ResBody, LocalsObj>> | void | Response<ResBody, LocalsObj>;

// Specific route parameter types
export interface IdParams {
  id: string;
}

export interface SlugParams {
  slug: string;
}

export interface FormIdParams {
  formId: string;
}

// Helper type for common route handlers
export type GetHandler<T = any> = RouteHandler<ParamsDictionary, T>;
export type PostHandler<T = any, B = any> = RouteHandler<ParamsDictionary, T, B>;
export type PutHandler<T = any, B = any> = RouteHandler<ParamsDictionary, T, B>;
export type DeleteHandler<T = any> = RouteHandler<ParamsDictionary, T>;

// Route handlers with specific params
export type IdGetHandler<T = any> = RouteHandler<IdParams, T>;
export type IdPostHandler<T = any, B = any> = RouteHandler<IdParams, T, B>;
export type IdPutHandler<T = any, B = any> = RouteHandler<IdParams, T, B>;
export type IdDeleteHandler<T = any> = RouteHandler<IdParams, T>;

export type SlugGetHandler<T = any> = RouteHandler<SlugParams, T>;
export type FormIdGetHandler<T = any> = RouteHandler<FormIdParams, T>;