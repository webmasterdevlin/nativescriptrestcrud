import { Component, OnInit } from "@angular/core";
import {PostService} from "../services/post.service"
import { Post } from "../models/post";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    posts: Post[] = [];

    constructor(private _postService: PostService) { }
    
    getPosts() {
        this._postService.getPosts()
            .subscribe(data => this.posts = data);
    }

    ngOnInit(): void {
        return this.getPosts();
    }

    onAdd() {
        let post = new Post();
        let date = new Date();
        let time = date.toTimeString();
        post.title = `Title: ${time}`;
        
        this._postService.addPost(post); // post to web service

        this.posts.unshift(post); // updates the UI. Should be the work of the backend
    }
    onUpdate() {
        let post = this.posts[0];
        post.title += " [updated]";

        this._postService.updatePost(post);
    }
    onDelete() {
        let post = this.posts[0];
        this._postService.deletePost(post);

        this.posts.splice(0, 1);
    }
}
