import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
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
    headers: new HttpHeaders({}),
    withCredentials: true
  };

  getActivePoll(): Observable<Poll> {
    let url = environment.pollApi.url + this.baseUrl + "/active";
    return this.http.get<Poll>(url, this.httpOptions);
  }

  getPollById(pollId: string): Observable<Poll> {
    let url = environment.pollApi.url + this.baseUrl + "/" + pollId;
    return this.http.get<Poll>(url, this.httpOptions);
  }

  vote(pollId: string, choice: string): Observable<Poll> {
    let vote = new Vote(pollId, choice);
    let url = environment.pollApi.url + this.baseUrl + "/" + pollId + "/vote";
    return this.http.put<Poll>(url, vote, this.httpOptions);
  }

  getVotesForPoll(pollId: string): Observable<Vote[]> {
    let url = environment.pollApi.url + this.baseUrl + "/" + pollId + "/vote";
    return this.http.get<Vote[]>(url, this.httpOptions);
  }
}
