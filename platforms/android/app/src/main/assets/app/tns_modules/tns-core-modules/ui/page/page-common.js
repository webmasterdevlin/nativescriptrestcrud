function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var content_view_1 = require("../content-view");
var frame_1 = require("../frame");
var action_bar_1 = require("../action-bar");
var style_scope_1 = require("../styling/style-scope");
var profiling_1 = require("../../profiling");
__export(require("../content-view"));
var PageBase = (function (_super) {
    __extends(PageBase, _super);
    function PageBase() {
        var _this = _super.call(this) || this;
        _this._styleScope = new style_scope_1.StyleScope();
        return _this;
    }
    Object.defineProperty(PageBase.prototype, "navigationContext", {
        get: function () {
            return this._navigationContext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageBase.prototype, "css", {
        get: function () {
            return this._styleScope.css;
        },
        set: function (value) {
            this._styleScope.css = value;
            this._onCssStateChange();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageBase.prototype, "actionBar", {
        get: function () {
            if (!this._actionBar) {
                this._actionBar = new action_bar_1.ActionBar();
                this._addView(this._actionBar);
            }
            return this._actionBar;
        },
        set: function (value) {
            if (!value) {
                throw new Error("ActionBar cannot be null or undefined.");
            }
            if (this._actionBar !== value) {
                if (this._actionBar) {
                    this._removeView(this._actionBar);
                }
                this._actionBar = value;
                this._addView(this._actionBar);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageBase.prototype, "statusBarStyle", {
        get: function () {
            return this.style.statusBarStyle;
        },
        set: function (value) {
            this.style.statusBarStyle = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageBase.prototype, "androidStatusBarBackground", {
        get: function () {
            return this.style.androidStatusBarBackground;
        },
        set: function (value) {
            this.style.androidStatusBarBackground = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PageBase.prototype, "page", {
        get: function () {
            return this;
        },
        enumerable: true,
        configurable: true
    });
    PageBase.prototype.addCss = function (cssString) {
        this._styleScope.addCss(cssString);
        this._onCssStateChange();
    };
    PageBase.prototype.addCssFile = function (cssFileName) {
        this._styleScope.addCssFile(cssFileName);
        this._onCssStateChange();
    };
    PageBase.prototype.getKeyframeAnimationWithName = function (animationName) {
        return this._styleScope.getKeyframeAnimationWithName(animationName);
    };
    Object.defineProperty(PageBase.prototype, "frame", {
        get: function () {
            var frame = this.parent;
            return frame instanceof frame_1.Frame ? frame : undefined;
        },
        enumerable: true,
        configurable: true
    });
    PageBase.prototype.createNavigatedData = function (eventName, isBackNavigation) {
        return {
            eventName: eventName,
            object: this,
            context: this.navigationContext,
            isBackNavigation: isBackNavigation
        };
    };
    PageBase.prototype.onNavigatingTo = function (context, isBackNavigation, bindingContext) {
        this._navigationContext = context;
        if (!isBackNavigation && bindingContext !== undefined && bindingContext !== null) {
            this.bindingContext = bindingContext;
        }
        this.notify(this.createNavigatedData(PageBase.navigatingToEvent, isBackNavigation));
    };
    PageBase.prototype.onNavigatedTo = function (isBackNavigation) {
        this.notify(this.createNavigatedData(PageBase.navigatedToEvent, isBackNavigation));
    };
    PageBase.prototype.onNavigatingFrom = function (isBackNavigation) {
        this.notify(this.createNavigatedData(PageBase.navigatingFromEvent, isBackNavigation));
    };
    PageBase.prototype.onNavigatedFrom = function (isBackNavigation) {
        this.notify(this.createNavigatedData(PageBase.navigatedFromEvent, isBackNavigation));
        this._navigationContext = undefined;
    };
    PageBase.prototype.showModal = function () {
        if (arguments.length === 0) {
            this._showNativeModalView(frame_1.topmost().currentPage, undefined, undefined, true);
            return this;
        }
        else {
            var context_1 = arguments[1];
            var closeCallback = arguments[2];
            var fullscreen = arguments[3];
            var page = void 0;
            if (arguments[0] instanceof PageBase) {
                page = arguments[0];
            }
            else {
                page = frame_1.resolvePageFromEntry({ moduleName: arguments[0] });
            }
            page._showNativeModalView(this, context_1, closeCallback, fullscreen);
            return page;
        }
    };
    PageBase.prototype.closeModal = function () {
        if (this._closeModalCallback) {
            this._closeModalCallback.apply(undefined, arguments);
        }
    };
    Object.defineProperty(PageBase.prototype, "modal", {
        get: function () {
            return this._modal;
        },
        enumerable: true,
        configurable: true
    });
    PageBase.prototype._addChildFromBuilder = function (name, value) {
        if (value instanceof action_bar_1.ActionBar) {
            this.actionBar = value;
        }
        else {
            _super.prototype._addChildFromBuilder.call(this, name, value);
        }
    };
    PageBase.prototype._showNativeModalView = function (parent, context, closeCallback, fullscreen) {
        parent._modal = this;
        var that = this;
        this._modalContext = context;
        this._closeModalCallback = function () {
            if (that._closeModalCallback) {
                that._closeModalCallback = null;
                that._modalContext = null;
                that._hideNativeModalView(parent);
                if (typeof closeCallback === "function") {
                    closeCallback.apply(undefined, arguments);
                }
            }
        };
    };
    PageBase.prototype._hideNativeModalView = function (parent) {
    };
    PageBase.prototype._raiseShownModallyEvent = function () {
        var args = {
            eventName: PageBase.shownModallyEvent,
            object: this,
            context: this._modalContext,
            closeCallback: this._closeModalCallback
        };
        this.notify(args);
    };
    PageBase.prototype._raiseShowingModallyEvent = function () {
        var args = {
            eventName: PageBase.showingModallyEvent,
            object: this,
            context: this._modalContext,
            closeCallback: this._closeModalCallback
        };
        this.notify(args);
    };
    PageBase.prototype.eachChildView = function (callback) {
        _super.prototype.eachChildView.call(this, callback);
        callback(this.actionBar);
    };
    Object.defineProperty(PageBase.prototype, "_childrenCount", {
        get: function () {
            return (this.content ? 1 : 0) + (this.actionBar ? 1 : 0);
        },
        enumerable: true,
        configurable: true
    });
    PageBase.prototype._inheritStyleScope = function (styleScope) {
    };
    PageBase.navigatingToEvent = "navigatingTo";
    PageBase.navigatedToEvent = "navigatedTo";
    PageBase.navigatingFromEvent = "navigatingFrom";
    PageBase.navigatedFromEvent = "navigatedFrom";
    PageBase.shownModallyEvent = "shownModally";
    PageBase.showingModallyEvent = "showingModally";
    __decorate([
        profiling_1.profile
    ], PageBase.prototype, "onNavigatingTo", null);
    __decorate([
        profiling_1.profile
    ], PageBase.prototype, "onNavigatedTo", null);
    __decorate([
        profiling_1.profile
    ], PageBase.prototype, "onNavigatingFrom", null);
    __decorate([
        profiling_1.profile
    ], PageBase.prototype, "onNavigatedFrom", null);
    return PageBase;
}(content_view_1.ContentView));
exports.PageBase = PageBase;
PageBase.prototype.recycleNativeView = "never";
exports.actionBarHiddenProperty = new content_view_1.Property({ name: "actionBarHidden", affectsLayout: content_view_1.isIOS, valueConverter: content_view_1.booleanConverter });
exports.actionBarHiddenProperty.register(PageBase);
exports.backgroundSpanUnderStatusBarProperty = new content_view_1.Property({ name: "backgroundSpanUnderStatusBar", defaultValue: false, affectsLayout: content_view_1.isIOS, valueConverter: content_view_1.booleanConverter });
exports.backgroundSpanUnderStatusBarProperty.register(PageBase);
exports.enableSwipeBackNavigationProperty = new content_view_1.Property({ name: "enableSwipeBackNavigation", defaultValue: true, valueConverter: content_view_1.booleanConverter });
exports.enableSwipeBackNavigationProperty.register(PageBase);
exports.statusBarStyleProperty = new content_view_1.CssProperty({ name: "statusBarStyle", cssName: "status-bar-style" });
exports.statusBarStyleProperty.register(content_view_1.Style);
exports.androidStatusBarBackgroundProperty = new content_view_1.CssProperty({
    name: "androidStatusBarBackground", cssName: "android-status-bar-background",
    equalityComparer: content_view_1.Color.equals, valueConverter: function (v) { return new content_view_1.Color(v); }
});
exports.androidStatusBarBackgroundProperty.register(content_view_1.Style);
//# sourceMappingURL=page-common.js.map