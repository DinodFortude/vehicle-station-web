import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class SocketServiceService {
  readonly uri: string = 'http://localhost:3001';
  constructor() {
    this.socket = io(this.uri);
  }

  socket: any;
  public message$: BehaviorSubject<string> = new BehaviorSubject('');

  public getNewMessage = () => {
    this.socket.on('message', (message: any) => {
      this.message$.next(message);
    });

    return this.message$.asObservable();
  };

  public sendMessage(message: any) {
    this.socket.emit('messagePass', message);
  }

  listen(eventName: string) {
    return new Observable((subcriber: any) => {
      this.socket.on(eventName, (data: any) => {
        subcriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
