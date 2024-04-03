"use client";

import io, { Socket } from "socket.io-client";
import { Device, types } from "mediasoup-client";
import { Result, unwrapResult } from "../utils";
import { StoreApi } from "zustand";
import { AppStore } from "./store";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

export type ProducerType = "video" | "audio" | "screen-video";

export default class GuggleWeedClient {
  private readonly username: string;
  private readonly meetingId: string;

  private readonly socket: Socket;

  private readonly device: types.Device;
  private _sendTransport?: types.Transport;
  private _receiveTransport?: types.Transport;

  private get sendTransport(): types.Transport {
    return this._sendTransport!;
  }

  private get receiveTransport(): types.Transport {
    return this._receiveTransport!;
  }
  
  private readonly producers: Map<ProducerType, types.Producer>;
  private readonly consumers: Map<string, types.Consumer>;

  public constructor(username: string, meetingId: string) {
    this.username = username;
    this.meetingId = meetingId;

    this.socket = io("http://localhost:8000", {
      extraHeaders: {
        "x-username": username,
        "x-meeting-id": meetingId
      }
    });

    this.device = new Device();

    this.producers = new Map<ProducerType, types.Producer>();
    this.consumers = new Map<string, types.Consumer>();
  }

  public setupStore(store: StoreApi<AppStore>) {
    this.socket.on("connect", () => {
      store.getState().onSocketConnected();
    });

    this.socket.on("connect_error", () => {
      store.getState().onSocketConnectionError();
    });

    this.socket.on("disconnect", () => {
      store.getState().onSocketDisconnected();
    });

    this.socket.on("meetingEnded", () => {
      this.dispose();
    });

    this.socket.on("messageSent", (chatMessage) => {
      if (store.getState().meetingStatus === "live") {
        store.getState().onChatMessageReceived(chatMessage);
      }
    });

    this.socket.on("attentionRequested", ({ attendeeId }) => {
      if (store.getState().meetingStatus === "live") {
        store.getState().onAttentionRequested(attendeeId);
      }
    });

    this.socket.on("attentionAccepted", ({ attendeeId }) => {
      if (store.getState().meetingStatus === "live") {
        toast({
          title: "Attention",
          description: `Please pay your attention on ${attendeeId}`
        });

        store.getState().onAttentionAccepted(attendeeId);
      }
    });

    this.socket.on("attendeeJoined", ({ attendeeId }) => {
      if (store.getState().meetingStatus === "live") {
        if (attendeeId !== this.username) {
          toast({
            title: "Attendee joined",
            description: `Attendee ${attendeeId} has just joined this meeting`
          });
        }
      }
    });

    this.socket.on("attendeeDisconnected", ({ attendeeId }) => {
      if (store.getState().meetingStatus === "live") {
        toast({
          title: "Attendee left",
          description: `Attendee ${attendeeId} has just left this meeting`
        });
      }
    });

    this.socket.on("attendeeError", ({ attendeeId }) => {
      if (store.getState().meetingStatus === "live") {
        toast({
          title: "Attendee left",
          description: `Attendee ${attendeeId} has just left this meeting`
        });
      }
    });

    this.socket.on("attendeeLeft", ({ attendeeId }) => {
      if (store.getState().meetingStatus === "live") {
        toast({
          title: "Attendee left",
          description: `Attendee ${attendeeId} has just left this meeting`
        });
      }
    });

    this.socket.on("producerCreated", async ({ attendeeId, producerId }) => {
      if (store.getState().meetingStatus === "live") {
        try {
          await store.getState().consumeMedia(attendeeId, producerId);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message
          });
        }
      }
    });

    this.socket.on("consumerClosed", ({ consumerId }) => {
      if (store.getState().meetingStatus === "live") {
        try {
          store.getState().onConsumerClosed(consumerId);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message
          });
        }
      }
    });

    this.socket.on("meetingEnded", () => {
      store.getState().onMeetingEnded();
    });
  }

  public dispose() {
    const events = [
      "connect", "connect_error", "disconnect",

      "messageSent",

      "attentionRequested", "attentionAccepted",

      "meetingEnded",

      "attendeeJoined", "attendeeLeft", "attendeeError", "attendeeDisconnected",

      "producerCreated",

      "consumerClosed", "consumerPaused", "consumerResumed"
    ];

    for (const event of events) {
      this.socket.off(event);
    }

    for (const [_, producer] of Array.from(this.producers.entries())) {
      producer.close();
    }

    this.socket.disconnect();
  }

  private send<T>(action: string, payload: any): Promise<T> {
    return new Promise((resolve, reject) => {
      this.socket.emit(action, payload, (result: Result<T>) => {
        if (result.status === "success") {
          resolve(result.data);
        } else {
          reject(new Error(result.message));
        }
      });
    });
  }

  public sendChatMessage(message: string) {
    this.socket.emit("sendMessage", { message });
  }

  public requestAttention() {
    this.socket.emit("requestAttention");
  }

  public acceptAttention(attendeeId: string) {
    this.socket.emit("acceptAttention", { attendeeId });
  }

  public async join() {
    const { routerRtpCapabilities, sendTransport, receiveTransport } = await this.send<{
      routerRtpCapabilities: types.RtpCapabilities,
      sendTransport: {
        id: string,
        iceParameters: types.IceParameters,
        iceCandidates: types.IceCandidate[],
        dtlsParameters: types.DtlsParameters
      },
      receiveTransport: {
        id: string,
        iceParameters: types.IceParameters,
        iceCandidates: types.IceCandidate[],
        dtlsParameters: types.DtlsParameters
      }
    }>("join", {});

    await this.device.load({ routerRtpCapabilities: routerRtpCapabilities });

    this._sendTransport = this.device.createSendTransport({ ...sendTransport });
    this._receiveTransport = this.device.createRecvTransport({ ...receiveTransport });

    this.sendTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await this.send("connectTransport", {
          transportType: "send",
          dtlsParameters
        });
        callback();
      } catch (error: any) {
        errback(error);
      }
    });

    this.sendTransport.on("produce", async ({ appData, rtpParameters }, callback, errback) => {
      try {
        const { producerId } = await this.send<{ producerId: string }>("produceMedia", { appData, rtpParameters });
        callback({ id: producerId });
      } catch (error: any) {
        errback(error);
      }
    });

    this.sendTransport.on("connectionstatechange", (state) => {
      if (state === "failed") {
        this.sendTransport.close();
      }
    });

    this.receiveTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      try {
        this.send("connectTransport", {
          transportType: "receive",
          dtlsParameters
        });
        callback();
      } catch (error: any) {
        errback(error);
      }
    });

    this.receiveTransport.on("connectionstatechange", (state) => {
      if (state === "failed") {
        this.receiveTransport.close();
      }
    });

    this.sendTransport.observer.on("close", () => {
      this.socket.disconnect();
    });

    this.receiveTransport.observer.on("close", () => {
      this.socket.disconnect();
    });

    return {
      sendTransport: this.sendTransport,
      receiveTransport: this.receiveTransport
    }
  }

  public async getAllAttendees(): Promise<{ attendeeId: any, producerIds: string[] }[]> {
    const response = await axios(`http://localhost:8000/meetings/${this.meetingId}/attendees`, {
      method: "get",
      headers: {
        "Content-Type": "application/json"
      }
    });

    return (unwrapResult(response.data) as any).attendees;
  }

  public async produceMedia(producerType: ProducerType) {
    if (this.producers.has(producerType)) {
      throw new Error(`There is already a producer of type ${producerType}`);
    }

    // @ts-ignore
    this.producers.set(producerType, null);

    try {
      if (producerType !== "audio" && !this.device.canProduce("video")) {
        throw new Error("This device can not produce video");
      }

      let stream: MediaStream;

      switch (producerType) {
        case "video":
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: true
          });
          break;

        case "audio":
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });
          break;

        case "screen-video":
          stream = await navigator.mediaDevices.getDisplayMedia({
            audio: false,
            video: true,
          });
          break;
      }

      let track: MediaStreamTrack;

      switch (producerType) {
        case "video":
          track = stream.getVideoTracks()[0];
          break;

        case "audio":
          track = stream.getAudioTracks()[0];
          break;

        case "screen-video":
          track = stream.getVideoTracks()[0];
          break;
      }

      let producer: types.Producer;

      switch (producerType) {
        case "video":
          producer = await this.sendTransport.produce({
            track,
            appData: { producerType },
            codecOptions: {
              videoGoogleStartBitrate: 1000
            },
            encodings: [
              {
                rid: "r0",
                maxBitrate: 100000,
                scalabilityMode: "S3T3"
              },
              {
                rid: "r1",
                maxBitrate: 300000,
                scalabilityMode: "S3T3"
              },
              {
                rid: "r2",
                maxBitrate: 900000,
                scalabilityMode: "S3T3"
              }
            ]
          });
          break;

        case "audio":
          producer = await this.sendTransport.produce({
            track,
            appData: { producerType }
          });
          break;

        case "screen-video":
          producer = await this.sendTransport.produce({
            track,
            appData: { producerType }
          });
          break;
      }

      this.producers.set(producerType, producer);

      producer.observer.on("close", () => {
        for (const track of stream.getAudioTracks()) {
          track.stop();
        }
      });

      return { stream, producer };
    } catch (error) {
      this.producers.delete(producerType);
      throw error;
    }
  }

  public async closeProducer(producerType: ProducerType) {
    if (!this.producers.has(producerType)) {
      throw new Error(`There is no producer of type ${producerType}`);
    }

    await this.send("closeProducer", { producerType });

    this.producers.get(producerType)?.close();

    this.producers.delete(producerType);
  }

  public async consumeMedia(producerId: string) {
    const { rtpCapabilities } = this.device;

    const { id, kind, rtpParameters } = await this.send<{ id: string, kind: types.MediaKind, rtpParameters: types.RtpParameters }>("consumeMedia", { producerId, rtpCapabilities });

    const consumer = await this.receiveTransport.consume({
      id, producerId, kind, rtpParameters
    });

    this.consumers.set(id, consumer);
    return { id, kind, consumer };
  }

  public closeLocalConsumer(consumerId: string) {
    this.consumers.get(consumerId)?.close();
    this.consumers.delete(consumerId);
  }
}