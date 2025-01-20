<template>
    <template v-if="sessionStore.session?.handle">
      <nav>
        <RouterLink to="/" >Following</RouterLink>
        <RouterLink to="/trending">Trending</RouterLink>
      </nav>

      <RouterView />

    </template>
    <template v-else>

      <h1>Bluesky Videos</h1>
      <p>Use your Bluesky identifier and generate an app password to login. All login data is stored client-side.</p>
      <input type="text" placeholder="identifier" v-model="identifierInput"><br/>
      <input type="password" placeholder="App Password" v-model="passwordInput"><br/>
      <button @click="login" :disabled="identifierInput === '' || passwordInput === ''">Login</button>

    </template>
</template>

<style lang="scss">
nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  height: 7vh;
  background: black;
  border-top: 2px solid #666;
  z-index: 900;
  display: flex;
  a {
    flex: 1;
    text-align: center;
    color: white;
    font-weight: bold;
    text-decoration: none;
    display: block;
    align-content: center;
    font-size: 2vh;
    &:hover {
      color: #666;
    }
    &.router-link-active {
      color: gold;
    }
  }
}
</style>

<script setup lang="ts">

import { RouterLink, RouterView } from 'vue-router';
import {useSessionStore} from "@/stores/session";
import {ref} from "vue";
import {useBskyAgentStore} from "@/stores/bskyAgent";

const sessionStore = useSessionStore();
const bskyAgentStore = useBskyAgentStore();

var identifierInput = ref('');
var passwordInput = ref('');

bskyAgentStore.initAgent();

if(sessionStore.hasSession()) {
  bskyAgentStore.resumeSession();
}

async function login() {
  await bskyAgentStore.login(
    identifierInput.value,
    passwordInput.value
  );
}

</script>
