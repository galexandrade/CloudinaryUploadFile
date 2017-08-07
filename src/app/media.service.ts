import { Http, Response, RequestOptions, Headers } from '@angular/http';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import 'rxjs/add/operator/toPromise';
import { Cloudinary } from '@cloudinary/angular-4.x';
import { NgZone, Injectable } from "@angular/core";

@Injectable()
export class MediaService {
    responses: Array<any>;
    private hasBaseDropZoneOver: boolean = false;
    private uploader: FileUploader;
    private title: string = '';
    private uploaderOptions: FileUploaderOptions;

    constructor(private cloudinary: Cloudinary,
                private zone: NgZone,
                private http: Http){
        this.responses = [];
        this.config(); 
    }

    config(){
        this.uploaderOptions = {
            url: `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/upload`,
            // Upload files automatically upon addition to upload queue
            autoUpload: false,
            // Use xhrTransport in favor of iframeTransport
            isHTML5: true,
            // Calculate progress independently for each uploaded file
            removeAfterUpload: true,
            // XHR request headers
            headers: [{
                name: 'X-Requested-With',
                value: 'XMLHttpRequest'
            }]
        };
    }

    setUpload(): FileUploader{
        this.uploader = new FileUploader(this.uploaderOptions);
        this.uploader.onBuildItemForm = this.onBuildItemForm.bind(this);;

        // Update model on completion of uploading a file
        this.uploader.onCompleteItem = this.onCompleteItem.bind(this);
    
        // Update model on upload progress event
        this.uploader.onProgressItem = this.onChangeProgress.bind(this);;

        return this.uploader;
    }

    onBuildItemForm(fileItem: any, form: FormData): any{
        console.log("onBuildItemForm");
        // Add Cloudinary's unsigned upload preset to the upload form
        form.append('upload_preset', this.cloudinary.config().upload_preset);
        // Add built-in and custom tags for displaying the uploaded photo in the list
        let tags = 'myphotoalbum';
        if (this.title) {
        form.append('context', `photo=${this.title}`);
        tags = `myphotoalbum,${this.title}`;
        }
        form.append('tags', tags);
        form.append('file', fileItem);

        // Use default "withCredentials" value for CORS requests
        fileItem.withCredentials = false;
        return { fileItem, form };
    }

    onChangeProgress(fileItem: any, progress: any){
        console.log("onChangeProgress");
        this.updateProgress({
            file: fileItem.file,
            progress,
            data: {}
        });
    }

    onCompleteItem(item: any, response: string, status: number, headers: ParsedResponseHeaders){
        console.log("onCompleteItem");
        console.log(response);
        this.updateProgress({
            file: item.file,
            status,
            data: JSON.parse(response)
        });
    }

    updateProgress(fileItem){
        console.log("updateProgress");
        // Run the update in a custom zone since for some reason change detection isn't performed
        // as part of the XHR request to upload the files.
        // Running in a custom zone forces change detection
        this.zone.run(() => {
            // Update an existing entry if it's upload hasn't completed yet
    
            // Find the id of an existing item
            const existingId = this.responses.reduce((prev, current, index) => {
                if (current.file.name === fileItem.file.name && !current.status) {
                return index;
                }
                return prev;
            }, -1);
            if (existingId > -1) {
                // Update existing item with new data
                this.responses[existingId] = Object.assign(this.responses[existingId], fileItem);
            } else {
                // Create new response
                this.responses.push(fileItem);
            }
        });
    };

    updateAll(){
        this.uploader.uploadAll();
    }

    delete (data: any) {
        console.log("delete");
        const url = `https://api.cloudinary.com/v1_1/${this.cloudinary.config().cloud_name}/delete_by_token`;
        let headers = new Headers({ 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' });
        let options = new RequestOptions({ headers: headers });

        const body = {
            token: data.delete_token
        };

        this.http.post(url, body, options)
            .toPromise()
            .then((response) => {
                console.log(`Deleted image - ${data.public_id} ${response.json().result}`);
            }).catch((err: any) => {
                console.log(`Failed to delete image ${data.public_id} ${err}`);
            });
    };

    getFileProperties(fileProperties: any) {
        // Transforms Javascript Object to an iterable to be used by *ngFor
        if (!fileProperties) {
          return null;
        }
        return Object.keys(fileProperties)
          .map((key) => ({ 'key': key, 'value': fileProperties[key] }));
    }

    fileDraggedOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }
}