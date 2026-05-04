type Factory<T> = (c: Container) => T;

export class Container {
  private singletons = new Map<string, unknown>();
  private factories = new Map<string, Factory<unknown>>();

  register<T>(token: string, factory: Factory<T>): void {
    this.factories.set(token, factory as Factory<unknown>);
  }

  resolve<T>(token: string): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }
    const factory = this.factories.get(token);
    if (!factory) throw new Error(`No provider for ${token}`);
    const instance = factory(this);
    this.singletons.set(token, instance);
    return instance as T;
  }
}