"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var PostService = /** @class */ (function () {
    function PostService(_httpClient) {
        this._httpClient = _httpClient;
        this._url = "http://jsonplaceholder.typicode.com/posts/";
    }
    PostService.prototype.getPosts = function () {
        return this._httpClient
            .get(this._url);
    };
    PostService.prototype.addPost = function (post) {
        return this._httpClient.post(this._url, post);
    };
    PostService.prototype.updatePost = function (post) {
        return this._httpClient.put("" + this._url + post.id, post);
    };
    PostService.prototype.deletePost = function (post) {
        return this._httpClient.delete("" + this._url + post.id);
    };
    PostService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient])
    ], PostService);
    return PostService;
}());
exports.PostService = PostService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicG9zdC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQTJDO0FBQzNDLDZDQUFpRDtBQU1qRDtJQUdJLHFCQUFvQixXQUF1QjtRQUF2QixnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUZuQyxTQUFJLEdBQVcsNENBQTRDLENBQUM7SUFFckIsQ0FBQztJQUVoRCw4QkFBUSxHQUFSO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXO2FBQ2xCLEdBQUcsQ0FBUyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELDZCQUFPLEdBQVAsVUFBUSxJQUFVO1FBQ2QsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDakQsQ0FBQztJQUVELGdDQUFVLEdBQVYsVUFBVyxJQUFVO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsZ0NBQVUsR0FBVixVQUFXLElBQVU7UUFDakIsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsRUFBSSxDQUFDLENBQUE7SUFDNUQsQ0FBQztJQXBCUSxXQUFXO1FBRHZCLGlCQUFVLEVBQUU7eUNBSXdCLGlCQUFVO09BSGxDLFdBQVcsQ0FxQnZCO0lBQUQsa0JBQUM7Q0FBQSxBQXJCRCxJQXFCQztBQXJCWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgSHR0cENsaWVudCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJ1xyXG5pbXBvcnQgeyBOYXRpdmVTY3JpcHRIdHRwQ2xpZW50TW9kdWxlIH0gZnJvbSBcIm5hdGl2ZXNjcmlwdC1hbmd1bGFyL2h0dHAtY2xpZW50XCI7XHJcbmltcG9ydCB7IE9ic2VydmFibGUgfSBmcm9tICdyeGpzL09ic2VydmFibGUnO1xyXG5pbXBvcnQgeyBQb3N0IH0gZnJvbSAnLi4vbW9kZWxzL3Bvc3QnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgUG9zdFNlcnZpY2Uge1xyXG4gICAgcHJpdmF0ZSBfdXJsOiBzdHJpbmcgPSBcImh0dHA6Ly9qc29ucGxhY2Vob2xkZXIudHlwaWNvZGUuY29tL3Bvc3RzL1wiO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgX2h0dHBDbGllbnQ6IEh0dHBDbGllbnQpIHsgfVxyXG4gICAgXHJcbiAgICBnZXRQb3N0cygpOiBPYnNlcnZhYmxlPFBvc3RbXT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9odHRwQ2xpZW50XHJcbiAgICAgICAgICAgIC5nZXQ8UG9zdFtdPih0aGlzLl91cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIGFkZFBvc3QocG9zdDogUG9zdCk6IE9ic2VydmFibGU8YW55PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2h0dHBDbGllbnQucG9zdCh0aGlzLl91cmwsIHBvc3QpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlUG9zdChwb3N0OiBQb3N0KTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faHR0cENsaWVudC5wdXQoYCR7dGhpcy5fdXJsfSR7cG9zdC5pZH1gLCBwb3N0KTtcclxuICAgIH1cclxuXHJcbiAgICBkZWxldGVQb3N0KHBvc3Q6IFBvc3QpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9odHRwQ2xpZW50LmRlbGV0ZShgJHt0aGlzLl91cmx9JHtwb3N0LmlkfWApXHJcbiAgICB9XHJcbn0iXX0=