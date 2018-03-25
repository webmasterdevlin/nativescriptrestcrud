import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { Observable } from 'rxjs/Observable';
import { Post } from '../models/post';

@Injectable()
export class PostService {
    private _url: string = "http://jsonplaceholder.typicode.com/posts/";

    constructor(private _httpClient: HttpClient) { }
    
    getPosts(): Observable<Post[]> {
        return this._httpClient
            .get<Post[]>(this._url);
    }

    addPost(post: Post): Observable<any> {
        return this._httpClient.post(this._url, post)
    }

    updatePost(post: Post): Observable<any> {
        return this._httpClient.put(`${this._url}${post.id}`, post);
    }

    deletePost(post: Post): Observable<any> {
        return this._httpClient.delete(`${this._url}${post.id}`)
    }
}