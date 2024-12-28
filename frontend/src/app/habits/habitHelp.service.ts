import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Message } from '@global/types/message';

@Injectable({
  providedIn: 'root'
})

export class HabitHelpService {


  #http = inject(HttpClient);


  initialize_chat(goal_id: string) {
    
  }

  post_message_and_get_response(message: string) : Message  {
   
    return {
      role: 'user',
      content: ''
    }
  }

  

}
