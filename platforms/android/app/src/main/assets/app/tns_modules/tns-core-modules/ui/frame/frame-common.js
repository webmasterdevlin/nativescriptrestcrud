function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var page_1 = require("../page");
var view_1 = require("../core/view");
var file_name_resolver_1 = require("../../file-system/file-name-resolver");
var file_system_1 = require("../../file-system");
var builder_1 = require("../builder");
var profiling_1 = require("../../profiling");
__export(require("../core/view"));
var frameStack = [];
function buildEntryFromArgs(arg) {
    var entry;
    if (typeof arg === "string") {
        entry = {
            moduleName: arg
        };
    }
    else if (typeof arg === "function") {
        entry = {
            create: arg
        };
    }
    else {
        entry = arg;
    }
    return entry;
}
function reloadPage() {
    var frame = topmost();
    if (frame) {
        if (frame.currentPage && frame.currentPage.modal) {
            frame.currentPage.modal.closeModal();
        }
        var currentEntry = frame._currentEntry.entry;
        var newEntry = {
            animated: false,
            clearHistory: true,
            context: currentEntry.context,
            create: currentEntry.create,
            moduleName: currentEntry.moduleName,
            backstackVisible: currentEntry.backstackVisible
        };
        frame.navigate(newEntry);
    }
}
exports.reloadPage = reloadPage;
global.__onLiveSyncCore = reloadPage;
var entryCreatePage = profiling_1.profile("entry.create", function (entry) {
    var page = entry.create();
    if (!page) {
        throw new Error("Failed to create Page with entry.create() function.");
    }
    return page;
});
var moduleCreatePage = profiling_1.profile("module.createPage", function (moduleNamePath, moduleExports) {
    if (view_1.traceEnabled()) {
        view_1.traceWrite("Calling createPage()", view_1.traceCategories.Navigation);
    }
    var page = moduleExports.createPage();
    var cssFileName = file_name_resolver_1.resolveFileName(moduleNamePath, "css");
    if (cssFileName) {
        page.addCssFile(cssFileName);
    }
    return page;
});
var loadPageModule = profiling_1.profile("loadPageModule", function (moduleNamePath, entry) {
    if (global.moduleExists(entry.moduleName)) {
        if (view_1.traceEnabled()) {
            view_1.traceWrite("Loading pre-registered JS module: " + entry.moduleName, view_1.traceCategories.Navigation);
        }
        return global.loadModule(entry.moduleName);
    }
    else {
        var moduleExportsResolvedPath = file_name_resolver_1.resolveFileName(moduleNamePath, "js");
        if (moduleExportsResolvedPath) {
            if (view_1.traceEnabled()) {
                view_1.traceWrite("Loading JS file: " + moduleExportsResolvedPath, view_1.traceCategories.Navigation);
            }
            moduleExportsResolvedPath = moduleExportsResolvedPath.substr(0, moduleExportsResolvedPath.length - 3);
            return global.loadModule(moduleExportsResolvedPath);
        }
    }
    return null;
});
var pageFromBuilder = profiling_1.profile("pageFromBuilder", function (moduleNamePath, moduleExports) {
    var page;
    var fileName = file_name_resolver_1.resolveFileName(moduleNamePath, "xml");
    if (fileName) {
        if (view_1.traceEnabled()) {
            view_1.traceWrite("Loading XML file: " + fileName, view_1.traceCategories.Navigation);
        }
        page = builder_1.loadPage(moduleNamePath, fileName, moduleExports);
    }
    return page;
});
exports.resolvePageFromEntry = profiling_1.profile("resolvePageFromEntry", function (entry) {
    var page;
    if (entry.create) {
        page = entryCreatePage(entry);
    }
    else if (entry.moduleName) {
        var currentAppPath = file_system_1.knownFolders.currentApp().path;
        var moduleNamePath = file_system_1.path.join(currentAppPath, entry.moduleName);
        view_1.traceWrite("frame module path: " + moduleNamePath, view_1.traceCategories.Navigation);
        view_1.traceWrite("frame module module: " + entry.moduleName, view_1.traceCategories.Navigation);
        var moduleExports = loadPageModule(moduleNamePath, entry);
        if (moduleExports && moduleExports.createPage) {
            page = moduleCreatePage(moduleNamePath, moduleExports);
        }
        else {
            page = pageFromBuilder(moduleNamePath, moduleExports);
        }
        if (!page) {
            throw new Error("Failed to load page XML file for module: " + entry.moduleName);
        }
    }
    return page;
});
var FrameBase = (function (_super) {
    __extends(FrameBase, _super);
    function FrameBase() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._backStack = new Array();
        _this._navigationQueue = new Array();
        _this._isInFrameStack = false;
        return _this;
    }
    FrameBase.prototype._addChildFromBuilder = function (name, value) {
        if (value instanceof page_1.Page) {
            this.navigate({ create: function () { return value; } });
        }
    };
    FrameBase.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._processNextNavigationEntry();
    };
    FrameBase.prototype.canGoBack = function () {
        var _this = this;
        var backstack = this._backStack.length;
        var previousForwardNotInBackstack = false;
        this._navigationQueue.forEach(function (item) {
            var entry = item.entry;
            if (item.isBackNavigation) {
                previousForwardNotInBackstack = false;
                if (!entry) {
                    backstack--;
                }
                else {
                    var backstackIndex = _this._backStack.indexOf(entry);
                    if (backstackIndex !== -1) {
                        backstack = backstackIndex;
                    }
                    else {
                        backstack--;
                    }
                }
            }
            else if (entry.entry.clearHistory) {
                previousForwardNotInBackstack = false;
                backstack = 0;
            }
            else {
                backstack++;
                if (previousForwardNotInBackstack) {
                    backstack--;
                }
                previousForwardNotInBackstack = entry.entry.backstackVisible === false;
            }
        });
        if (this._navigationQueue.length > 0 && !this._currentEntry) {
            backstack--;
        }
        return backstack > 0;
    };
    FrameBase.prototype.goBack = function (backstackEntry) {
        if (view_1.traceEnabled()) {
            view_1.traceWrite("GO BACK", view_1.traceCategories.Navigation);
        }
        if (!this.canGoBack()) {
            return;
        }
        if (backstackEntry) {
            var index_1 = this._backStack.indexOf(backstackEntry);
            if (index_1 < 0) {
                return;
            }
        }
        var navigationContext = {
            entry: backstackEntry,
            isBackNavigation: true
        };
        this._navigationQueue.push(navigationContext);
        this._processNextNavigationEntry();
    };
    FrameBase.prototype._removeEntry = function (removed) {
        var page = removed.resolvedPage;
        var frame = page.frame;
        page._frame = null;
        if (frame) {
            frame._removeView(page);
        }
        else {
            page._tearDownUI(true);
        }
    };
    FrameBase.prototype.navigate = function (param) {
        if (view_1.traceEnabled()) {
            view_1.traceWrite("NAVIGATE", view_1.traceCategories.Navigation);
        }
        var entry = buildEntryFromArgs(param);
        var page = exports.resolvePageFromEntry(entry);
        this._pushInFrameStack();
        var backstackEntry = {
            entry: entry,
            resolvedPage: page,
            navDepth: undefined,
            fragmentTag: undefined
        };
        var navigationContext = {
            entry: backstackEntry,
            isBackNavigation: false
        };
        this._navigationQueue.push(navigationContext);
        this._processNextNavigationEntry();
    };
    FrameBase.prototype.isCurrent = function (entry) {
        return this._currentEntry === entry;
    };
    FrameBase.prototype.setCurrent = function (entry, isBack) {
        var newPage = entry.resolvedPage;
        if (!newPage.frame) {
            this._addView(newPage);
            newPage._frame = this;
        }
        this._currentEntry = entry;
        this._executingEntry = null;
        newPage.onNavigatedTo(isBack);
    };
    FrameBase.prototype._updateBackstack = function (entry, isBack) {
        var _this = this;
        this.raiseCurrentPageNavigatedEvents(isBack);
        var current = this._currentEntry;
        if (isBack) {
            var index_2 = this._backStack.indexOf(entry);
            this._backStack.splice(index_2 + 1).forEach(function (e) { return _this._removeEntry(e); });
            this._backStack.pop();
        }
        else {
            if (entry.entry.clearHistory) {
                this._backStack.forEach(function (e) { return _this._removeEntry(e); });
                this._backStack.length = 0;
            }
            else if (FrameBase._isEntryBackstackVisible(current)) {
                this._backStack.push(current);
            }
        }
        if (current && this._backStack.indexOf(current) < 0) {
            this._removeEntry(current);
        }
    };
    FrameBase.prototype.raiseCurrentPageNavigatedEvents = function (isBack) {
        var page = this.currentPage;
        if (page) {
            if (page.isLoaded) {
                page.onUnloaded();
            }
            page.onNavigatedFrom(isBack);
        }
    };
    FrameBase.prototype._processNavigationQueue = function (page) {
        if (this._navigationQueue.length === 0) {
            return;
        }
        var entry = this._navigationQueue[0].entry;
        var currentNavigationPage = entry.resolvedPage;
        if (page !== currentNavigationPage) {
            return;
        }
        this._navigationQueue.shift();
        this._processNextNavigationEntry();
        this._updateActionBar();
    };
    FrameBase.prototype._findEntryForTag = function (fragmentTag) {
        var entry;
        if (this._currentEntry && this._currentEntry.fragmentTag === fragmentTag) {
            entry = this._currentEntry;
        }
        else {
            entry = this._backStack.find(function (value) { return value.fragmentTag === fragmentTag; });
            if (!entry) {
                var navigationItem = this._navigationQueue.find(function (value) { return value.entry.fragmentTag === fragmentTag; });
                entry = navigationItem ? navigationItem.entry : undefined;
            }
        }
        return entry;
    };
    FrameBase.prototype.navigationQueueIsEmpty = function () {
        return this._navigationQueue.length === 0;
    };
    FrameBase._isEntryBackstackVisible = function (entry) {
        if (!entry) {
            return false;
        }
        var backstackVisibleValue = entry.entry.backstackVisible;
        var backstackHidden = backstackVisibleValue !== undefined && !backstackVisibleValue;
        return !backstackHidden;
    };
    FrameBase.prototype._updateActionBar = function (page, disableNavBarAnimation) {
    };
    FrameBase.prototype._processNextNavigationEntry = function () {
        if (!this.isLoaded || this._executingEntry) {
            return;
        }
        if (this._navigationQueue.length > 0) {
            var navigationContext = this._navigationQueue[0];
            if (navigationContext.isBackNavigation) {
                this.performGoBack(navigationContext);
            }
            else {
                this.performNavigation(navigationContext);
            }
        }
    };
    FrameBase.prototype.performNavigation = function (navigationContext) {
        var navContext = navigationContext.entry;
        this._executingEntry = navContext;
        this._onNavigatingTo(navContext, navigationContext.isBackNavigation);
        this._navigateCore(navContext);
    };
    FrameBase.prototype.performGoBack = function (navigationContext) {
        var backstackEntry = navigationContext.entry;
        var backstack = this._backStack;
        if (!backstackEntry) {
            backstackEntry = backstack[backstack.length - 1];
            navigationContext.entry = backstackEntry;
        }
        this._executingEntry = backstackEntry;
        this._onNavigatingTo(backstackEntry, true);
        this._goBackCore(backstackEntry);
    };
    FrameBase.prototype._goBackCore = function (backstackEntry) {
        if (view_1.traceEnabled()) {
            view_1.traceWrite("GO BACK CORE(" + this._backstackEntryTrace(backstackEntry) + "); currentPage: " + this.currentPage, view_1.traceCategories.Navigation);
        }
    };
    FrameBase.prototype._navigateCore = function (backstackEntry) {
        if (view_1.traceEnabled()) {
            view_1.traceWrite("NAVIGATE CORE(" + this._backstackEntryTrace(backstackEntry) + "); currentPage: " + this.currentPage, view_1.traceCategories.Navigation);
        }
    };
    FrameBase.prototype._onNavigatingTo = function (backstackEntry, isBack) {
        if (this.currentPage) {
            this.currentPage.onNavigatingFrom(isBack);
        }
        backstackEntry.resolvedPage.onNavigatingTo(backstackEntry.entry.context, isBack, backstackEntry.entry.bindingContext);
    };
    Object.defineProperty(FrameBase.prototype, "animated", {
        get: function () {
            return this._animated;
        },
        set: function (value) {
            this._animated = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FrameBase.prototype, "transition", {
        get: function () {
            return this._transition;
        },
        set: function (value) {
            this._transition = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FrameBase.prototype, "backStack", {
        get: function () {
            return this._backStack.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FrameBase.prototype, "currentPage", {
        get: function () {
            if (this._currentEntry) {
                return this._currentEntry.resolvedPage;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(FrameBase.prototype, "currentEntry", {
        get: function () {
            if (this._currentEntry) {
                return this._currentEntry.entry;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    FrameBase.prototype._pushInFrameStack = function () {
        if (this._isInFrameStack) {
            return;
        }
        frameStack.push(this);
        this._isInFrameStack = true;
    };
    FrameBase.prototype._popFromFrameStack = function () {
        if (!this._isInFrameStack) {
            return;
        }
        var top = topmost();
        if (top !== this) {
            throw new Error("Cannot pop a Frame which is not at the top of the navigation stack.");
        }
        frameStack.pop();
        this._isInFrameStack = false;
    };
    Object.defineProperty(FrameBase.prototype, "_childrenCount", {
        get: function () {
            if (this.currentPage) {
                return 1;
            }
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    FrameBase.prototype.eachChildView = function (callback) {
        var page = this.currentPage;
        if (page) {
            callback(page);
        }
    };
    FrameBase.prototype._getIsAnimatedNavigation = function (entry) {
        if (entry && entry.animated !== undefined) {
            return entry.animated;
        }
        if (this.animated !== undefined) {
            return this.animated;
        }
        return FrameBase.defaultAnimatedNavigation;
    };
    FrameBase.prototype._getNavigationTransition = function (entry) {
        if (entry) {
            if (view_1.isIOS && entry.transitioniOS !== undefined) {
                return entry.transitioniOS;
            }
            if (view_1.isAndroid && entry.transitionAndroid !== undefined) {
                return entry.transitionAndroid;
            }
            if (entry.transition !== undefined) {
                return entry.transition;
            }
        }
        if (this.transition !== undefined) {
            return this.transition;
        }
        return FrameBase.defaultTransition;
    };
    Object.defineProperty(FrameBase.prototype, "navigationBarHeight", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    FrameBase.prototype._getNavBarVisible = function (page) {
        throw new Error();
    };
    FrameBase.prototype._addViewToNativeVisualTree = function (child) {
        return true;
    };
    FrameBase.prototype._removeViewFromNativeVisualTree = function (child) {
        child._isAddedToNativeVisualTree = false;
    };
    FrameBase.prototype._printFrameBackStack = function () {
        var length = this.backStack.length;
        var i = length - 1;
        console.log("Frame Back Stack: ");
        while (i >= 0) {
            var backstackEntry = this.backStack[i--];
            console.log("\t" + backstackEntry.resolvedPage);
        }
    };
    FrameBase.prototype._backstackEntryTrace = function (b) {
        var result = "" + b.resolvedPage;
        var backstackVisible = FrameBase._isEntryBackstackVisible(b);
        if (!backstackVisible) {
            result += " | INVISIBLE";
        }
        if (b.entry.clearHistory) {
            result += " | CLEAR HISTORY";
        }
        var animated = this._getIsAnimatedNavigation(b.entry);
        if (!animated) {
            result += " | NOT ANIMATED";
        }
        var t = this._getNavigationTransition(b.entry);
        if (t) {
            result += " | Transition[" + JSON.stringify(t) + "]";
        }
        return result;
    };
    FrameBase.androidOptionSelectedEvent = "optionSelected";
    FrameBase.defaultAnimatedNavigation = true;
    __decorate([
        profiling_1.profile
    ], FrameBase.prototype, "onLoaded", null);
    __decorate([
        profiling_1.profile
    ], FrameBase.prototype, "performNavigation", null);
    __decorate([
        profiling_1.profile
    ], FrameBase.prototype, "performGoBack", null);
    return FrameBase;
}(view_1.CustomLayoutView));
exports.FrameBase = FrameBase;
function topmost() {
    if (frameStack.length > 0) {
        return frameStack[frameStack.length - 1];
    }
    return undefined;
}
exports.topmost = topmost;
function goBack() {
    var top = topmost();
    if (top && top.canGoBack()) {
        top.goBack();
        return true;
    }
    if (frameStack.length > 1) {
        top._popFromFrameStack();
    }
    return false;
}
exports.goBack = goBack;
function stack() {
    return frameStack;
}
exports.stack = stack;
//# sourceMappingURL=frame-common.js.map