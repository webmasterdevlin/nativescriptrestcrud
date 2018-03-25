Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var trace_1 = require("../trace");
var page_router_outlet_1 = require("./page-router-outlet");
var router_extensions_1 = require("./router-extensions");
var types_1 = require("tns-core-modules/utils/types");
/**
 * The nsRouterLink directive lets you link to specific parts of your app.
 *
 * Consider the following route configuration:
 * ```
 * [{ path: "/user", component: UserCmp }]
 * ```
 *
 * When linking to this `User` route, you can write:
 *
 * ```
 * <a [nsRouterLink]="["/user"]">link to user component</a>
 * ```
 *
 * NSRouterLink expects the value to be an array of path segments, followed by the params
 * for that level of routing. For instance `["/team", {teamId: 1}, "user", {userId: 2}]`
 * means that we want to generate a link to `/team;teamId=1/user;userId=2`.
 *
 * The first segment name can be prepended with `/`, `./`, or `../`.
 * If the segment begins with `/`, the router will look up the route from the root of the app.
 * If the segment begins with `./`, or doesn"t begin with a slash, the router will
 * instead look in the current component"s children for the route.
 * And if the segment begins with `../`, the router will go up one level.
 */
var NSRouterLink = /** @class */ (function () {
    function NSRouterLink(router, navigator, route, pageRoute) {
        this.router = router;
        this.navigator = navigator;
        this.route = route;
        this.pageRoute = pageRoute;
        // tslint:disable-line:directive-class-suffix
        this.commands = [];
        this.pageTransition = true;
        this.usePageRoute = (this.pageRoute && this.route === this.pageRoute.activatedRoute.getValue());
    }
    Object.defineProperty(NSRouterLink.prototype, "currentRoute", {
        get: function () {
            return this.usePageRoute ? this.pageRoute.activatedRoute.getValue() : this.route;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NSRouterLink.prototype, "params", {
        set: function (data) {
            if (Array.isArray(data)) {
                this.commands = data;
            }
            else {
                this.commands = [data];
            }
        },
        enumerable: true,
        configurable: true
    });
    NSRouterLink.prototype.onTap = function () {
        trace_1.routerLog("nsRouterLink.tapped: " + this.commands + " usePageRoute: " +
            this.usePageRoute + " clearHistory: " + this.clearHistory + " transition: " +
            JSON.stringify(this.pageTransition));
        var extras = this.getExtras();
        this.navigator.navigateByUrl(this.urlTree, extras);
    };
    NSRouterLink.prototype.getExtras = function () {
        var transition = this.getTransition();
        return {
            queryParams: this.queryParams,
            fragment: this.fragment,
            clearHistory: this.convertClearHistory(this.clearHistory),
            animated: transition.animated,
            transition: transition.transition,
            relativeTo: this.currentRoute,
        };
    };
    NSRouterLink.prototype.convertClearHistory = function (value) {
        return value === true || value === "true";
    };
    NSRouterLink.prototype.getTransition = function () {
        if (typeof this.pageTransition === "boolean") {
            return { animated: this.pageTransition };
        }
        else if (types_1.isString(this.pageTransition)) {
            if (this.pageTransition === "none" || this.pageTransition === "false") {
                return { animated: false };
            }
            else {
                return { animated: true, transition: { name: this.pageTransition } };
            }
        }
        else {
            return {
                animated: true,
                transition: this.pageTransition
            };
        }
    };
    NSRouterLink.prototype.ngOnChanges = function (_) {
        this.updateUrlTree();
    };
    NSRouterLink.prototype.updateUrlTree = function () {
        this.urlTree = this.router.createUrlTree(this.commands, { relativeTo: this.currentRoute, queryParams: this.queryParams, fragment: this.fragment });
    };
    NSRouterLink.decorators = [
        { type: core_1.Directive, args: [{ selector: "[nsRouterLink]" },] },
    ];
    /** @nocollapse */
    NSRouterLink.ctorParameters = function () { return [
        { type: router_1.Router, },
        { type: router_extensions_1.RouterExtensions, },
        { type: router_1.ActivatedRoute, },
        { type: page_router_outlet_1.PageRoute, decorators: [{ type: core_1.Optional },] },
    ]; };
    NSRouterLink.propDecorators = {
        "target": [{ type: core_1.Input },],
        "queryParams": [{ type: core_1.Input },],
        "fragment": [{ type: core_1.Input },],
        "clearHistory": [{ type: core_1.Input },],
        "pageTransition": [{ type: core_1.Input },],
        "params": [{ type: core_1.Input, args: ["nsRouterLink",] },],
        "onTap": [{ type: core_1.HostListener, args: ["tap",] },],
    };
    return NSRouterLink;
}());
exports.NSRouterLink = NSRouterLink;
//# sourceMappingURL=ns-router-link.js.map