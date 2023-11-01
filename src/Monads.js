export function success(x) {
    return {
        isSuccess: () => true,
        filter: p => {
            if (p(x)) return success(x);
            return fail();
        },
        map: f => {
            try {
                return success(f(x));
            } catch (e) {
                // console.debug("Caught exception in success map", e);
                return fail(x);
            }
        },
        failBind: () => success(x),
        orCatch: () => x
    }
}

export function fail(x) {
    const monad = {}
    monad.isSuccess = () => false;
    monad.filter = () => monad;
    monad.map = () => monad;
    monad.failBind = (f) => f(x);
    monad.orCatch = (lazyError) => lazyError(x);
    return monad;
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