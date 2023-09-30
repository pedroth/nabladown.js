export function success(x) {
    return {
        filter: p => {
            if (p(x)) return success(x);
            return fail();
        },
        map: t => {
            return success(t(x));
        },
        actual: () => x
    }
}

export function fail() {
    const monad = {}
    monad.filter = () => monad;
    monad.map = () => monad;
    monad.actual = (lazyError) => lazyError();
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

export function just(x) {
    return { map: f => maybe(f(x)), orSome: () => x }
}

export function none() {
    return { map: () => none(), orSome: f => f() }
}

export function maybe(x) {
    if (x) {
        return just(x);
    }
    return none(x)
}