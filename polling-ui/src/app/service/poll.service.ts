import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http'
import { Observable } from "rxjs"
import { Poll } from '../model/poll';
import { Vote } from '../model/vote';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PollService {

  baseUrl: string = '/poll'

  constructor(private http: HttpClient) {}

  httpOptions = {
    withCredentials: true
  };

  getPollsByPage(page: number, number: number): Observable<HttpResponse<Poll[]>> {
    let url = `${environment.pollApi.url}${this.baseUrl}?page=${page}&number=${number}`;
    return this.http.get<Poll[]>(url, { withCredentials: true, observe: 'response' });
  }

  getActivePoll(): Observable<Poll> {
    let url = `${environment.pollApi.url}${this.baseUrl}/active`;
    return this.http.get<Poll>(url, this.httpOptions,);
  }

  getPollById(pollId: string): Observable<Poll> {
    let url = `${environment.pollApi.url}${this.baseUrl}/${pollId}`;
    return this.http.get<Poll>(url, this.httpOptions);
  }

  vote(pollId: string, choice: string): Observable<Poll> {
    let vote = new Vote(pollId, choice);
    let url = `${environment.pollApi.url}${this.baseUrl}/${pollId}/vote`;
    return this.http.put<Poll>(url, vote, this.httpOptions);
  }

  getVotesForPoll(pollId: string, page: number, number: number): Observable<HttpResponse<Vote[]>> {
    let url = `${environment.pollApi.url}${this.baseUrl}/${pollId}/vote?page=${page}&number=${number}`;
    return this.http.get<Vote[]>(url, { withCredentials: true, observe: 'response' });
  }
}
