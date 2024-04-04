import { createStore, StoreApi } from "zustand";
import GuggleWeedClient from "./guggle-weed-client";
import { produce } from "immer";
import { types } from "mediasoup-client";

type ConnectionState = "initializing" | "initialization_error" | "ready" | "joining" | "joined" | "disconnected";

type MeetingStatus = "live" | "ended";

type ChatMessage = {
  sender: string
  message: string
}

type AppState = {
  connectionState: ConnectionState

  meetingStatus: MeetingStatus
  
  chatBox: {
    message: string
    chatMessages: ChatMessage[]
  }

  presentationRequests: string[]

  selfStream: {
    video: MediaStream | null
    screenVideo: MediaStream | null
    isSharingVideo: boolean
    isSharingAudio: boolean
    isSharingScreenVideo: boolean
  }

  otherMedias: {
    id: string
    username: string
    kind: types.MediaKind
    stream: MediaStream
  }[]
}

type AppAction = {
  onSocketConnected: () => void
  onSocketConnectionError: () => void
  onSocketDisconnected: () => void

  onMeetingEnded: () => void

  enterMessage: (message: string) => void
  sendChatMessage: () => void
  onChatMessageReceived: (chatMessage: ChatMessage) => void

  requestPresentation: () => void
  onPresentationRequested: (attendeeId: string) => void
  acceptPresentation: (attendeeId: string) => void
  rejectPresentation: (attendeeId: string) => void
  onPresentationAccepted: (attendeeId: string) => void

  joinMeeting: () => Promise<void>
  
  openVideo: () => Promise<void>
  openAudio: () => Promise<void>
  openScreenVideo: () => Promise<void>

  closeVideo: () => Promise<void>
  closeAudio: () => Promise<void>
  closeScreenVideo: () => Promise<void>

  consumeMedia: (attendeeId: string, producerId: string) => Promise<void>
  onConsumerClosed: (consumerId: string) => void
}

export type AppStore = AppState & AppAction

export default function buildAppStore(client: GuggleWeedClient): StoreApi<AppStore> {

  const store = createStore<AppStore>((set, get) => ({
    connectionState: "initializing",

    meetingStatus: "live",
    
    chatBox: {
      message: "",
      chatMessages: []
    },

    presentationRequests: [],
    
    selfStream: {
      video: null,
      screenVideo: null,
      isSharingVideo: false,
      isSharingAudio: false,
      isSharingScreenVideo: false
    },

    otherMedias: [],

    enterMessage: (message) => set((state) => ({
      chatBox: produce(state.chatBox, (draft) => {
        draft.message = message;
      })
    })),
    
    sendChatMessage: () => {
      client.sendChatMessage(get().chatBox.message);
      
      set((state) => ({
        chatBox: produce(state.chatBox, (draft) => {
          draft.message = "";
        })
      }));
    },

    onSocketConnected: () => set({
      connectionState: "ready"
    }),

    onSocketConnectionError: () => set({
      connectionState: "initialization_error"
    }),

    onSocketDisconnected: () => set({
      connectionState: "disconnected"
    }),

    onMeetingEnded: () => set(() => ({ meetingStatus: "ended" })),

    onChatMessageReceived: (chatMessage) => set((state) => ({
      chatBox: produce(state.chatBox, (draft) => {
        draft.chatMessages.push(chatMessage);
      })
    })),

    requestPresentation: () => {
      client.requestPresentation();
    },

    onPresentationRequested: (attendeeId) => set((state) => ({
      presentationRequests: produce(state.presentationRequests, (draft) => {
        const index = draft.findIndex((username) => username === attendeeId);

        if (index === -1) {
          draft.push(attendeeId);
        } else {
          draft.splice(index, 1);
          draft.splice(0, 0, attendeeId);
        }
      })
    })),

    acceptPresentation: (attendeeId) => {
      client.acceptPresentation(attendeeId);
      
      set((state) => ({
        presentationRequests: produce(state.presentationRequests, (draft) => {
          const index = draft.findIndex((username) => username === attendeeId);

          if (index !== -1) {
            draft.splice(index, 1);
          }
        })
      }));
    },

    rejectPresentation: (attendeeId) => {
      set((state) => ({
        presentationRequests: produce(state.presentationRequests, (draft) => {
          const index = draft.findIndex((username) => username === attendeeId);

          if (index !== -1) {
            draft.splice(index, 1);
          }
        })
      }));
    },

    onPresentationAccepted: (attendeeId) => {
      let draft = Array.from(get().otherMedias);

      const medias = draft.filter(({ kind, username }) => kind === "video" && username === attendeeId);

      draft = [...medias, ...draft.filter(({ kind, username }) => !(kind === "video" && username === attendeeId))];

      set(() => ({
        otherMedias: draft
      }));
    },

    joinMeeting: async () => {
      set({ connectionState: "joining" });
      try {
        const { sendTransport, receiveTransport } = await client.join();

        sendTransport.observer.on("close", () => {
          set({ connectionState: "disconnected" });
        });

        receiveTransport.observer.on("close", () => {
          set({ connectionState: "disconnected" });
        })

        set({ connectionState: "joined" });

        const attendees = await client.getAllAttendees();

        for (const { attendeeId, producerIds } of attendees) {
          for (const producerId of producerIds) {
            await get().consumeMedia(attendeeId, producerId);
          }
        }
      } catch (error) {
        set({ connectionState: "ready" });
        throw error;
      }
    },

    openVideo: async () => {
      const { stream, producer } = await client.produceMedia("video");

      set((state) => ({
        selfStream: {
          ...state.selfStream,
          video: stream,
          isSharingVideo: true
        }
      }));

      producer.on("trackended", async () => {
        try {
          await get().closeVideo();
        } catch (error) {
          console.error(error);
        }
      });

      producer.on("transportclose", async () => {
        try {
          await get().closeVideo();
        } catch (error) {
          console.error(error);
        }
      });
    },

    openAudio: async () => {
      const { producer } = await client.produceMedia("audio");

      set((state) => ({
        selfStream: {
          ...state.selfStream,
          isSharingAudio: true
        }
      }))

      producer.on("trackended", async () => {
        try {
          await get().closeAudio();
        } catch (error) {
          console.error(error);
        }
      });

      producer.on("transportclose", async () => {
        try {
          await get().closeAudio();
        } catch (error) {
          console.error(error);
        }
      });
    },

    openScreenVideo: async () => {
      const { stream, producer } = await client.produceMedia("screen-video");

      set((state) => ({
        selfStream: {
          ...state.selfStream,
          screenVideo: stream,
          isSharingScreenVideo: true
        }
      }));

      producer.on("trackended", async () => {
        try {
          await get().closeScreenVideo();
        } catch (error) {
          console.error(error);
        }
      });

      producer.on("transportclose", async () => {
        try {
          await get().closeScreenVideo();
        } catch (error) {
          console.error(error);
        }
      });
    },

    closeVideo: async () => {
      await client.closeProducer("video");

      set((state) => ({
        selfStream: {
          ...state.selfStream,
          video: null,
          isSharingVideo: false
        }
      }));
    },

    closeAudio: async () => {
      await client.closeProducer("audio");

      set((state) => ({
        selfStream: {
          ...state.selfStream,
          isSharingAudio: false
        }
      }));
    },

    closeScreenVideo: async () => {
      await client.closeProducer("screen-video");

      set((state) => ({
        selfStream: {
          ...state.selfStream,
          screenVideo: null,
          isSharingScreenVideo: false
        }
      }));
    },

    consumeMedia: async (attedeeId, producerId) => {
      try {
        const { id, kind, consumer } = await client.consumeMedia(producerId);

        const stream = new MediaStream([consumer.track]);

        set((state) => ({
          otherMedias: [
            ...state.otherMedias, 
            {
              id, kind, stream,
              username: attedeeId
            }
          ]
        }));
      } catch (error) {
        console.error(error);
      }
    },

    onConsumerClosed: (consumerId) => {
      const index = get().otherMedias.findIndex(({ id }) => id === consumerId);

      if (index !== -1) {
        client.closeLocalConsumer(consumerId);

        set((state) => ({
          otherMedias: [...state.otherMedias.slice(0, index), ...state.otherMedias.slice(index + 1)]
        }));
      }
    },
  }));

  client.setupStore(store);

  return store
}