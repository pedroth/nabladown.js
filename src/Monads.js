export function success(x) {
    const monad = {};
    monad.isSuccess = () => true;
    monad.filter = p => {
        if (p(x)) return success(x);
        return fail();
    }
    monad.map = f => {
        try {
            return success(f(x));
        } catch (e) {
            // console.debug("Caught exception in success map", e);
            return fail(x);
        }
    }
    monad.flatMap = (f) => f(x);
    monad.failBind = () => success(x);
    monad.orCatch = () => x;
    return monad;
}

export function fail(x) {
    const monad = {}
    monad.isSuccess = () => false;
    monad.filter = () => monad;
    monad.map = () => monad;
    monad.flatMap = () => monad;
    monad.failBind = (f) => f(x);
    monad.orCatch = (lazyError = x => x) => lazyError(x);
    return monad;
}

export function Try(x) {
    if (x || x.isSuccess()) return success(x);
    return fail();
}

export function left(x) {
    return {
        mapLeft: f => left(f(x)),
        mapRight: () => left(x),
        actual: () => x
    }
}

export function right(x) {
    return {
        mapLeft: () => right(x),
        mapRight: f => right(f(x)),
        actual: () => x
    }
}

export function either(a, b) {
    if (a) return left(a);
    return right(b);
}

export function some(x) {
    return {
        map: f => maybe(f(x)),
        orElse: () => x
    }
}

export function none() {
    return { map: () => none(), orElse: f => f() }
}

export function maybe(x) {
    if (x) {
        return some(x);
    }
    return none(x)
}