import { ref } from 'vue'
import { defineStore } from 'pinia'
import {type AtpSessionData} from "@atproto/api";

export const useSessionStore = defineStore('session', () => {

  const session = ref(localStorage.getItem('atpSession') ? JSON.parse(localStorage.getItem('atpSession')!) : undefined as AtpSessionData|undefined);

  function initSession(atpSession: AtpSessionData) {
    session.value = atpSession;
    localStorage.setItem('atpSession', JSON.stringify(atpSession));
  }

  function hasSession() {
    return session.value !== undefined;
  }

  return { session, initSession, hasSession };
})
