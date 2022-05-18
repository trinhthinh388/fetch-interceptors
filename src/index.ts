import { withInterceptors } from './interceptors';

const IS_WORKER = typeof importScripts === 'function';
withInterceptors(IS_WORKER ? self : window);
