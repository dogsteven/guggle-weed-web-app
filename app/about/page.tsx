import StandardLayout from "@/components/layouts/standard/standard-layout";
import SystemArchirecture from "./system-architecture.png";
import Image from "next/image";

export default async function Home() {
  return (
    <StandardLayout>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="grid grid-cols-2 w-full gap-4">
          <div>
            <p>
              This system consists 4 components: the SFUs, the Broker, the Socket Handler and the Web Application.
            </p>            
            <ol className="list-decimal list-inside">
              <li>The <b>SFUs</b> (Selective Forwarding Units) manage the logic of meetings and their attendees in the media plane.</li>
              <li>The <b>Broker</b> works similarly to a reversed proxy: it selectively picks an SFU for instantiating a meeting and forwards each command to an appropriate SFU.</li>
              <li>The <b>Socket Handler</b> handles the connections of attendees in each meeting. It also acts as an instant messaging service that notifies attendees about events that have taken place.</li>
              <li>The <b>Web Application</b> is an interactive web application that users use to start and join a video conference.</li>
            </ol>
            <br />

            <p>
              At this moment, we choose <a href="https://mediasoup.org/" className="underline">mediasoup</a> to implement the SFUs for its performance, signaling agnostic and working seamlessly on many operating systems.
            </p>
            <br />

            <p>
              The Broker maintains an in-memory hash map storing information about each meeting and its corresponding SFU's address. Of course, we can move that hash map to persistent storage to make the Broker stateless and scale out to multiple nodes to produce higher availability. We keep the map in memory for simplicity. The round-robin algorithm is applied to select an SFU for a new meeting.
            </p>
            <br />

            <p>
              Most of the communication methods used in the system are synchronous, but there are some cases when the SFUs want to notify attendees to perform appropriate actions on local machines.
              To decouple the SFUs and the Socket Handler, <a href="https://redis.io/" className="underline">Redis</a> is used as the communication channel because of its simplicity and low latency.
            </p>
          </div>
          <div>
            <Image alt="Overall system architecture" src={SystemArchirecture} priority={false} />
          </div>
        </div>
      </main>
    </StandardLayout>
  );
}
