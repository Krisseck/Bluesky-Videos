import { ref } from 'vue'
import { defineStore } from 'pinia'
import {AtpAgent, type AtpPersistSessionHandler} from "@atproto/api";
import {useSessionStore} from "@/stores/session";
import {type FeedViewPost} from "@atproto/api/dist/client/types/app/bsky/feed/defs";

export const useBskyAgentStore = defineStore('bsky-agent', () => {

  const sessionStore = useSessionStore();

  const agent = ref(undefined as AtpAgent|undefined);

  function initAgent() {
    agent.value = new AtpAgent({
      service: 'https://bsky.social',
      persistSession: (evt, sess) => {
        sessionStore.initSession(sess!);
        return;
      },
    });
  }

  function resumeSession() {
      agent.value!.resumeSession(sessionStore.session);
  }

  async function login(identifier: string, password: string) {
    return await agent.value!.login({
      identifier,
      password
    });
  }

  async function getFeed(feed: string) {
    let timeline = await agent.value!.app.bsky.feed.getFeed({
      feed
    });
    return filterPosts(timeline.data.feed);
  }

  async function getTimeline() {
    let timeline = await agent.value!.getTimeline();
    return filterPosts(timeline.data.feed);
  }

  function filterPosts(posts: FeedViewPost[]) {
    // Filter replies and embedded posts
    return posts.filter((post: FeedViewPost) => {
      return post.reply === undefined && (post.post.embed === undefined || post.post.embed.$type !== 'app.bsky.embed.record#view');
    });
  }

  return { agent, initAgent, resumeSession, login, getFeed, getTimeline };
})
