Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var frame_1 = require("tns-core-modules/ui/frame");
var page_1 = require("tns-core-modules/ui/page");
var profiling_1 = require("tns-core-modules/profiling");
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
var platform_providers_1 = require("../platform-providers");
var trace_1 = require("../trace");
var detached_loader_1 = require("../common/detached-loader");
var view_util_1 = require("../view-util");
var ns_location_strategy_1 = require("./ns-location-strategy");
var ns_route_reuse_strategy_1 = require("./ns-route-reuse-strategy");
var PageRoute = /** @class */ (function () {
    function PageRoute(startRoute) {
        this.activatedRoute = new BehaviorSubject_1.BehaviorSubject(startRoute);
    }
    return PageRoute;
}());
exports.PageRoute = PageRoute;
// Used to "mark" ActivatedRoute snapshots that are handled in PageRouterOutlet
exports.pageRouterActivatedSymbol = Symbol("page-router-activated");
exports.loaderRefSymbol = Symbol("loader-ref");
function destroyComponentRef(componentRef) {
    if (componentRef) {
        var loaderRef = componentRef[exports.loaderRefSymbol];
        if (loaderRef) {
            loaderRef.destroy();
        }
        componentRef.destroy();
    }
}
exports.destroyComponentRef = destroyComponentRef;
var ChildInjector = /** @class */ (function () {
    function ChildInjector(providers, parent) {
        this.providers = providers;
        this.parent = parent;
    }
    ChildInjector.prototype.get = function (token, notFoundValue) {
        var localValue = this.providers.get(token);
        if (localValue) {
            return localValue;
        }
        return this.parent.get(token, notFoundValue);
    };
    return ChildInjector;
}());
/**
 * There are cases where multiple activatedRoute nodes should be associated/handled by the same PageRouterOutlet.
 * We can gat additional ActivatedRoutes nodes when there is:
 *  - Lazy loading - there is an additional ActivatedRoute node for the RouteConfig with the `loadChildren` setup
 *  - Componentless routes - there is an additional ActivatedRoute node for the componentless RouteConfig
 *
 * Example:
 *   R  <-- root
 *   |
 * feature (lazy module) <-- RouteConfig: { path: "lazy", loadChildren: "./feature/feature.module#FeatureModule" }
 *   |
 * module (componentless route) <-- RouteConfig: { path: "module", children: [...] } // Note: No 'component'
 *   |
 *  home <-- RouteConfig: { path: "module", component: MyComponent } - this is what we get as activatedRoute param
 *
 *  In these cases we will mark the top-most node (feature). NSRouteReuseStrategy will detach the tree there and
 *  use this ActivateRoute as a kay for caching.
 */
function findTopActivatedRouteNodeForOutlet(activatedRoute) {
    var outletActivatedRoute = activatedRoute;
    while (outletActivatedRoute.parent &&
        outletActivatedRoute.parent.routeConfig &&
        !outletActivatedRoute.parent.routeConfig.component) {
        outletActivatedRoute = outletActivatedRoute.parent;
    }
    return outletActivatedRoute;
}
exports.findTopActivatedRouteNodeForOutlet = findTopActivatedRouteNodeForOutlet;
function routeToString(activatedRoute) {
    return activatedRoute.pathFromRoot.join("->");
}
var PageRouterOutlet = /** @class */ (function () {
    function PageRouterOutlet(parentContexts, location, name, locationStrategy, componentFactoryResolver, resolver, frame, changeDetector, device, pageFactory, routeReuseStrategy) {
        this.parentContexts = parentContexts;
        this.location = location;
        this.locationStrategy = locationStrategy;
        this.componentFactoryResolver = componentFactoryResolver;
        this.resolver = resolver;
        this.frame = frame;
        this.changeDetector = changeDetector;
        this.pageFactory = pageFactory;
        this.routeReuseStrategy = routeReuseStrategy;
        // tslint:disable-line:directive-class-suffix
        this.activated = null;
        this._activatedRoute = null;
        this.isInitialPage = true;
        this.activateEvents = new core_1.EventEmitter();
        this.deactivateEvents = new core_1.EventEmitter();
        this.name = name || router_1.PRIMARY_OUTLET;
        parentContexts.onChildOutletCreated(this.name, this);
        this.viewUtil = new view_util_1.ViewUtil(device);
        this.detachedLoaderFactory = resolver.resolveComponentFactory(detached_loader_1.DetachedLoader);
    }
    Object.defineProperty(PageRouterOutlet.prototype, "locationInjector", {
        /** @deprecated from Angular since v4 */
        get: /** @deprecated from Angular since v4 */
        function () { return this.location.injector; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageRouterOutlet.prototype, "locationFactoryResolver", {
        /** @deprecated from Angular since v4 */
        get: /** @deprecated from Angular since v4 */
        function () { return this.resolver; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageRouterOutlet.prototype, "isActivated", {
        get: function () {
            return !!this.activated;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageRouterOutlet.prototype, "component", {
        get: function () {
            if (!this.activated) {
                throw new Error("Outlet is not activated");
            }
            return this.activated.instance;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageRouterOutlet.prototype, "activatedRoute", {
        get: function () {
            if (!this.activated) {
                throw new Error("Outlet is not activated");
            }
            return this._activatedRoute;
        },
        enumerable: true,
        configurable: true
    });
    PageRouterOutlet.prototype.ngOnInit = function () {
        if (this.isActivated) {
            return;
        }
        // If the outlet was not instantiated at the time the route got activated we need to populate
        // the outlet when it is initialized (ie inside a NgIf)
        var context = this.parentContexts.getContext(this.name);
        if (!context || !context.route) {
            return;
        }
        if (context.attachRef) {
            // `attachRef` is populated when there is an existing component to mount
            this.attach(context.attachRef, context.route);
        }
        else {
            // otherwise the component defined in the configuration is created
            this.activateWith(context.route, context.resolver || null);
        }
    };
    PageRouterOutlet.prototype.ngOnDestroy = function () {
        this.parentContexts.onChildOutletDestroyed(this.name);
    };
    PageRouterOutlet.prototype.deactivate = function () {
        if (!this.locationStrategy._isPageNavigatingBack()) {
            throw new Error("Currently not in page back navigation" +
                " - component should be detached instead of deactivated.");
        }
        trace_1.routerLog("PageRouterOutlet.deactivate() while going back - should destroy");
        if (!this.isActivated) {
            return;
        }
        var c = this.activated.instance;
        destroyComponentRef(this.activated);
        this.activated = null;
        this._activatedRoute = null;
        this.deactivateEvents.emit(c);
    };
    /**
     * Called when the `RouteReuseStrategy` instructs to detach the subtree
     */
    /**
         * Called when the `RouteReuseStrategy` instructs to detach the subtree
         */
    PageRouterOutlet.prototype.detach = /**
         * Called when the `RouteReuseStrategy` instructs to detach the subtree
         */
    function () {
        if (!this.isActivated) {
            throw new Error("Outlet is not activated");
        }
        trace_1.routerLog("PageRouterOutlet.detach() - " + routeToString(this._activatedRoute));
        var component = this.activated;
        this.activated = null;
        this._activatedRoute = null;
        return component;
    };
    /**
     * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
     */
    /**
         * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
         */
    PageRouterOutlet.prototype.attach = /**
         * Called when the `RouteReuseStrategy` instructs to re-attach a previously detached subtree
         */
    function (ref, activatedRoute) {
        trace_1.routerLog("PageRouterOutlet.attach() - " + routeToString(activatedRoute));
        this.activated = ref;
        this._activatedRoute = activatedRoute;
        this.markActivatedRoute(activatedRoute);
        this.locationStrategy._finishBackPageNavigation();
    };
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    /**
         * Called by the Router to instantiate a new component during the commit phase of a navigation.
         * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
         */
    PageRouterOutlet.prototype.activateWith = /**
         * Called by the Router to instantiate a new component during the commit phase of a navigation.
         * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
         */
    function (activatedRoute, resolver) {
        if (this.locationStrategy._isPageNavigatingBack()) {
            throw new Error("Currently in page back navigation - component should be reattached instead of activated.");
        }
        trace_1.routerLog("PageRouterOutlet.activateWith() - " + routeToString(activatedRoute));
        this._activatedRoute = activatedRoute;
        this.markActivatedRoute(activatedRoute);
        resolver = resolver || this.resolver;
        this.activateOnGoForward(activatedRoute, resolver);
        this.activateEvents.emit(this.activated.instance);
    };
    PageRouterOutlet.prototype.activateOnGoForward = function (activatedRoute, loadedResolver) {
        var pageRoute = new PageRoute(activatedRoute);
        var providers = this.initProvidersMap(activatedRoute, pageRoute);
        var childInjector = new ChildInjector(providers, this.location.injector);
        var factory = this.getComponentFactory(activatedRoute, loadedResolver);
        if (this.isInitialPage) {
            trace_1.routerLog("PageRouterOutlet.activate() initial page - just load component");
            this.isInitialPage = false;
            this.activated = this.location.createComponent(factory, this.location.length, childInjector, []);
            this.changeDetector.markForCheck();
        }
        else {
            trace_1.routerLog("PageRouterOutlet.activate() forward navigation - " +
                "create detached loader in the loader container");
            var page = this.pageFactory({
                isNavigation: true,
                componentType: factory.componentType,
            });
            providers.set(page_1.Page, page);
            var loaderRef = this.location.createComponent(this.detachedLoaderFactory, this.location.length, childInjector, []);
            this.changeDetector.markForCheck();
            this.activated = loaderRef.instance.loadWithFactory(factory);
            this.loadComponentInPage(page, this.activated);
            this.activated[exports.loaderRefSymbol] = loaderRef;
        }
    };
    PageRouterOutlet.prototype.initProvidersMap = function (activatedRoute, pageRoute) {
        var providers = new Map();
        providers.set(PageRoute, pageRoute);
        providers.set(router_1.ActivatedRoute, activatedRoute);
        var childContexts = this.parentContexts.getOrCreateContext(this.name).children;
        providers.set(router_1.ChildrenOutletContexts, childContexts);
        return providers;
    };
    PageRouterOutlet.prototype.loadComponentInPage = function (page, componentRef) {
        var _this = this;
        // Component loaded. Find its root native view.
        var componentView = componentRef.location.nativeElement;
        // Remove it from original native parent.
        this.viewUtil.removeChild(componentView.parent, componentView);
        // Add it to the new page
        page.content = componentView;
        page.on(page_1.Page.navigatedFromEvent, global.Zone.current.wrap(function (args) {
            if (args.isBackNavigation) {
                _this.locationStrategy._beginBackPageNavigation();
                _this.locationStrategy.back();
            }
        }));
        var navOptions = this.locationStrategy._beginPageNavigation();
        // Clear refCache if navigation with clearHistory
        if (navOptions.clearHistory) {
            var clearCallback_1 = function () {
                return setTimeout(function () {
                    _this.routeReuseStrategy.clearCache();
                    page.off(page_1.Page.navigatedToEvent, clearCallback_1);
                });
            };
            page.on(page_1.Page.navigatedToEvent, clearCallback_1);
        }
        this.frame.navigate({
            create: function () { return page; },
            clearHistory: navOptions.clearHistory,
            animated: navOptions.animated,
            transition: navOptions.transition
        });
    };
    PageRouterOutlet.prototype.markActivatedRoute = function (activatedRoute) {
        var nodeToMark = findTopActivatedRouteNodeForOutlet(activatedRoute.snapshot);
        nodeToMark[exports.pageRouterActivatedSymbol] = true;
        trace_1.routerLog("Activated route marked as page: " + routeToString(nodeToMark));
    };
    PageRouterOutlet.prototype.getComponentFactory = function (activatedRoute, loadedResolver) {
        var component = activatedRoute.routeConfig.component;
        return loadedResolver ?
            loadedResolver.resolveComponentFactory(component) :
            this.componentFactoryResolver.resolveComponentFactory(component);
    };
    PageRouterOutlet.decorators = [
        { type: core_1.Directive, args: [{ selector: "page-router-outlet" },] },
    ];
    /** @nocollapse */
    PageRouterOutlet.ctorParameters = function () { return [
        { type: router_1.ChildrenOutletContexts, },
        { type: core_1.ViewContainerRef, },
        { type: undefined, decorators: [{ type: core_1.Attribute, args: ["name",] },] },
        { type: ns_location_strategy_1.NSLocationStrategy, },
        { type: core_1.ComponentFactoryResolver, },
        { type: core_1.ComponentFactoryResolver, },
        { type: frame_1.Frame, },
        { type: core_1.ChangeDetectorRef, },
        { type: undefined, decorators: [{ type: core_1.Inject, args: [platform_providers_1.DEVICE,] },] },
        { type: undefined, decorators: [{ type: core_1.Inject, args: [platform_providers_1.PAGE_FACTORY,] },] },
        { type: ns_route_reuse_strategy_1.NSRouteReuseStrategy, },
    ]; };
    PageRouterOutlet.propDecorators = {
        "activateEvents": [{ type: core_1.Output, args: ["activate",] },],
        "deactivateEvents": [{ type: core_1.Output, args: ["deactivate",] },],
    };
    __decorate([
        profiling_1.profile,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [router_1.ActivatedRoute,
            core_1.ComponentFactoryResolver]),
        __metadata("design:returntype", void 0)
    ], PageRouterOutlet.prototype, "activateWith", null);
    __decorate([
        profiling_1.profile,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [page_1.Page, core_1.ComponentRef]),
        __metadata("design:returntype", void 0)
    ], PageRouterOutlet.prototype, "loadComponentInPage", null);
    return PageRouterOutlet;
}());
exports.PageRouterOutlet = PageRouterOutlet;
//# sourceMappingURL=page-router-outlet.js.map