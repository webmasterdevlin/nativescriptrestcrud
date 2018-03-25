Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var trace_1 = require("../trace");
var ns_location_strategy_1 = require("./ns-location-strategy");
var page_router_outlet_1 = require("./page-router-outlet");
/**
 * Detached state cache
 */
var /**
 * Detached state cache
 */
DetachedStateCache = /** @class */ (function () {
    function DetachedStateCache() {
        this.cache = new Array();
    }
    Object.defineProperty(DetachedStateCache.prototype, "length", {
        get: function () {
            return this.cache.length;
        },
        enumerable: true,
        configurable: true
    });
    DetachedStateCache.prototype.push = function (cacheItem) {
        this.cache.push(cacheItem);
    };
    DetachedStateCache.prototype.pop = function () {
        return this.cache.pop();
    };
    DetachedStateCache.prototype.peek = function () {
        return this.cache[this.cache.length - 1];
    };
    DetachedStateCache.prototype.clear = function () {
        trace_1.routeReuseStrategyLog("DetachedStateCache.clear() " + this.cache.length + " items will be destroyed");
        while (this.cache.length > 0) {
            var state = this.cache.pop().state;
            if (!state.componentRef) {
                throw new Error("No componentRed found in DetachedRouteHandle");
            }
            page_router_outlet_1.destroyComponentRef(state.componentRef);
        }
    };
    return DetachedStateCache;
}());
/**
 * Detaches subtrees loaded inside PageRouterOutlet in forward navigation
 * and reattaches them on back.
 * Reuses routes as long as their route config is the same.
 */
var NSRouteReuseStrategy = /** @class */ (function () {
    function NSRouteReuseStrategy(location) {
        this.location = location;
        this.cache = new DetachedStateCache();
    }
    NSRouteReuseStrategy.prototype.shouldDetach = function (route) {
        route = page_router_outlet_1.findTopActivatedRouteNodeForOutlet(route);
        var key = getSnapshotKey(route);
        var isPageActivated = route[page_router_outlet_1.pageRouterActivatedSymbol];
        var isBack = this.location._isPageNavigatingBack();
        var shouldDetach = !isBack && isPageActivated;
        trace_1.routeReuseStrategyLog("shouldDetach isBack: " + isBack + " key: " + key + " result: " + shouldDetach);
        return shouldDetach;
    };
    NSRouteReuseStrategy.prototype.shouldAttach = function (route) {
        route = page_router_outlet_1.findTopActivatedRouteNodeForOutlet(route);
        var key = getSnapshotKey(route);
        var isBack = this.location._isPageNavigatingBack();
        var shouldAttach = isBack && this.cache.peek().key === key;
        trace_1.routeReuseStrategyLog("shouldAttach isBack: " + isBack + " key: " + key + " result: " + shouldAttach);
        return shouldAttach;
    };
    NSRouteReuseStrategy.prototype.store = function (route, state) {
        route = page_router_outlet_1.findTopActivatedRouteNodeForOutlet(route);
        var key = getSnapshotKey(route);
        trace_1.routeReuseStrategyLog("store key: " + key + ", state: " + state);
        if (state) {
            this.cache.push({ key: key, state: state });
        }
        else {
            var topItem = this.cache.peek();
            if (topItem.key === key) {
                this.cache.pop();
            }
            else {
                throw new Error("Trying to pop from DetachedStateCache but keys don't match. " +
                    ("expected: " + topItem.key + " actual: " + key));
            }
        }
    };
    NSRouteReuseStrategy.prototype.retrieve = function (route) {
        route = page_router_outlet_1.findTopActivatedRouteNodeForOutlet(route);
        var key = getSnapshotKey(route);
        var isBack = this.location._isPageNavigatingBack();
        var cachedItem = this.cache.peek();
        var state = null;
        if (isBack && cachedItem && cachedItem.key === key) {
            state = cachedItem.state;
        }
        trace_1.routeReuseStrategyLog("retrieved isBack: " + isBack + " key: " + key + " state: " + state);
        return state;
    };
    NSRouteReuseStrategy.prototype.shouldReuseRoute = function (future, curr) {
        var shouldReuse = future.routeConfig === curr.routeConfig;
        if (shouldReuse && curr && curr[page_router_outlet_1.pageRouterActivatedSymbol]) {
            // When reusing route - copy the pageRouterActivated to the new snapshot
            // It's needed in shouldDetach to determine if the route should be detached.
            future[page_router_outlet_1.pageRouterActivatedSymbol] = curr[page_router_outlet_1.pageRouterActivatedSymbol];
        }
        trace_1.routeReuseStrategyLog("shouldReuseRoute result: " + shouldReuse);
        return shouldReuse;
    };
    NSRouteReuseStrategy.prototype.clearCache = function () {
        this.cache.clear();
    };
    NSRouteReuseStrategy.decorators = [
        { type: core_1.Injectable },
    ];
    /** @nocollapse */
    NSRouteReuseStrategy.ctorParameters = function () { return [
        { type: ns_location_strategy_1.NSLocationStrategy, },
    ]; };
    return NSRouteReuseStrategy;
}());
exports.NSRouteReuseStrategy = NSRouteReuseStrategy;
function getSnapshotKey(snapshot) {
    return snapshot.pathFromRoot.join("->");
}
//# sourceMappingURL=ns-route-reuse-strategy.js.map