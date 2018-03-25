"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var post_service_1 = require("../services/post.service");
var post_1 = require("../models/post");
var HomeComponent = /** @class */ (function () {
    function HomeComponent(_postService) {
        this._postService = _postService;
        this.posts = [];
    }
    HomeComponent.prototype.getPosts = function () {
        var _this = this;
        this._postService.getPosts()
            .subscribe(function (data) { return _this.posts = data; });
    };
    HomeComponent.prototype.ngOnInit = function () {
        return this.getPosts();
    };
    HomeComponent.prototype.onAdd = function () {
        var post = new post_1.Post();
        var date = new Date();
        var time = date.toTimeString();
        post.title = "Title: " + time;
        this._postService.addPost(post); // post to web service
        this.posts.unshift(post); // updates the UI. Should be the work of the backend
    };
    HomeComponent.prototype.onUpdate = function () {
        var post = this.posts[0];
        post.title += " [updated]";
        this._postService.updatePost(post);
    };
    HomeComponent.prototype.onDelete = function () {
        var post = this.posts[0];
        this._postService.deletePost(post);
        this.posts.splice(0, 1);
    };
    HomeComponent = __decorate([
        core_1.Component({
            selector: "Home",
            moduleId: module.id,
            templateUrl: "./home.component.html"
        }),
        __metadata("design:paramtypes", [post_service_1.PostService])
    ], HomeComponent);
    return HomeComponent;
}());
exports.HomeComponent = HomeComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaG9tZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJob21lLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHNDQUFrRDtBQUNsRCx5REFBb0Q7QUFDcEQsdUNBQXNDO0FBT3RDO0lBSUksdUJBQW9CLFlBQXlCO1FBQXpCLGlCQUFZLEdBQVosWUFBWSxDQUFhO1FBRjdDLFVBQUssR0FBVyxFQUFFLENBQUM7SUFFOEIsQ0FBQztJQUVsRCxnQ0FBUSxHQUFSO1FBQUEsaUJBR0M7UUFGRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRTthQUN2QixTQUFTLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFJLENBQUMsS0FBSyxHQUFHLElBQUksRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCxnQ0FBUSxHQUFSO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBRUQsNkJBQUssR0FBTDtRQUNJLElBQUksSUFBSSxHQUFHLElBQUksV0FBSSxFQUFFLENBQUM7UUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN0QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxZQUFVLElBQU0sQ0FBQztRQUU5QixJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtRQUV2RCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9EQUFvRDtJQUNsRixDQUFDO0lBQ0QsZ0NBQVEsR0FBUjtRQUNJLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekIsSUFBSSxDQUFDLEtBQUssSUFBSSxZQUFZLENBQUM7UUFFM0IsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELGdDQUFRLEdBQVI7UUFDSSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRW5DLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBcENRLGFBQWE7UUFMekIsZ0JBQVMsQ0FBQztZQUNQLFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtZQUNuQixXQUFXLEVBQUUsdUJBQXVCO1NBQ3ZDLENBQUM7eUNBS29DLDBCQUFXO09BSnBDLGFBQWEsQ0FxQ3pCO0lBQUQsb0JBQUM7Q0FBQSxBQXJDRCxJQXFDQztBQXJDWSxzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgT25Jbml0IH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHtQb3N0U2VydmljZX0gZnJvbSBcIi4uL3NlcnZpY2VzL3Bvc3Quc2VydmljZVwiXHJcbmltcG9ydCB7IFBvc3QgfSBmcm9tIFwiLi4vbW9kZWxzL3Bvc3RcIjtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6IFwiSG9tZVwiLFxyXG4gICAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcclxuICAgIHRlbXBsYXRlVXJsOiBcIi4vaG9tZS5jb21wb25lbnQuaHRtbFwiXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBIb21lQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcclxuXHJcbiAgICBwb3N0czogUG9zdFtdID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBfcG9zdFNlcnZpY2U6IFBvc3RTZXJ2aWNlKSB7IH1cclxuICAgIFxyXG4gICAgZ2V0UG9zdHMoKSB7XHJcbiAgICAgICAgdGhpcy5fcG9zdFNlcnZpY2UuZ2V0UG9zdHMoKVxyXG4gICAgICAgICAgICAuc3Vic2NyaWJlKGRhdGEgPT4gdGhpcy5wb3N0cyA9IGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25Jbml0KCk6IHZvaWQge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldFBvc3RzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25BZGQoKSB7XHJcbiAgICAgICAgbGV0IHBvc3QgPSBuZXcgUG9zdCgpO1xyXG4gICAgICAgIGxldCBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBsZXQgdGltZSA9IGRhdGUudG9UaW1lU3RyaW5nKCk7XHJcbiAgICAgICAgcG9zdC50aXRsZSA9IGBUaXRsZTogJHt0aW1lfWA7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fcG9zdFNlcnZpY2UuYWRkUG9zdChwb3N0KTsgLy8gcG9zdCB0byB3ZWIgc2VydmljZVxyXG5cclxuICAgICAgICB0aGlzLnBvc3RzLnVuc2hpZnQocG9zdCk7IC8vIHVwZGF0ZXMgdGhlIFVJLiBTaG91bGQgYmUgdGhlIHdvcmsgb2YgdGhlIGJhY2tlbmRcclxuICAgIH1cclxuICAgIG9uVXBkYXRlKCkge1xyXG4gICAgICAgIGxldCBwb3N0ID0gdGhpcy5wb3N0c1swXTtcclxuICAgICAgICBwb3N0LnRpdGxlICs9IFwiIFt1cGRhdGVkXVwiO1xyXG5cclxuICAgICAgICB0aGlzLl9wb3N0U2VydmljZS51cGRhdGVQb3N0KHBvc3QpO1xyXG4gICAgfVxyXG4gICAgb25EZWxldGUoKSB7XHJcbiAgICAgICAgbGV0IHBvc3QgPSB0aGlzLnBvc3RzWzBdO1xyXG4gICAgICAgIHRoaXMuX3Bvc3RTZXJ2aWNlLmRlbGV0ZVBvc3QocG9zdCk7XHJcblxyXG4gICAgICAgIHRoaXMucG9zdHMuc3BsaWNlKDAsIDEpO1xyXG4gICAgfVxyXG59XHJcbiJdfQ==