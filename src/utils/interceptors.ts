import { Interceptor } from "../core/types";

export class InterceptorManager<T> {
  private interceptors: Array<Interceptor<T> | null> = [];

  use(
    fulfilled?: (value: T) => T | Promise<T>,
    rejected?: (error: any) => any
  ): number {
    this.interceptors.push({
      fulfilled,
      rejected,
    });
    return this.interceptors.length - 1;
  }

  eject(id: number): void {
    if (this.interceptors[id]) {
      this.interceptors[id] = null;
    }
  }

  clear(): void {
    this.interceptors = [];
  }

  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    this.interceptors.forEach((interceptor) => {
      if (interceptor !== null) {
        fn(interceptor);
      }
    });
  }
}
