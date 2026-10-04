import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

/** Video counterpart to ImagesService — same contract (POST a file, get a URL back), pointed at
 *  the videos upload endpoint, which accepts MP4/WebM/MOV up to 50MB. */
@Injectable({ providedIn: 'root' })
export class VideosService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string }>(`${API_BASE_URL}/api/v1/admin/videos`, formData)
      .pipe(map((response) => `${API_BASE_URL}${response.url}`));
  }
}
