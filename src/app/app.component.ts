import { Component, OnInit, Input, NgZone } from '@angular/core';
import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import 'rxjs/add/operator/toPromise';
import { Cloudinary } from '@cloudinary/angular-4.x';
import { MediaService } from "app/media.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  responses: Array<any>;

  private hasBaseDropZoneOver: boolean = false;
  private uploader: FileUploader;
  private title: string;

  constructor(
    private mediaService: MediaService
  ) {
    this.responses = [];
    this.title = '';
  }

  ngOnInit(): void {
    this.uploader = this.mediaService.setUpload();
    this.responses = this.mediaService.responses;    
  }

  updateTitle(value: string) {
    this.title = value;
  }

  fileOverBase(e: any): void {
    this.fileOverBase(e);
  }

  uploadAll(){
    this.mediaService.updateAll();
  }

  getFileProperties(fileProperties: any){
    return this.mediaService.getFileProperties(fileProperties);
  }

  deleteImage(data, i){
    this.mediaService.delete(data);
    this.responses.splice(i, 1);
  }
      
}
