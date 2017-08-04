import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import * as cloudinary from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-4.x';
import cloudinaryConfiguration from './config';
import { AppComponent } from './app.component';
import { FileUploadModule } from 'ng2-file-upload';
import { MidiaService } from "app/media.service";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FileUploadModule,
    CloudinaryModule.forRoot(cloudinary, cloudinaryConfiguration),
  ],
  providers: [MidiaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
